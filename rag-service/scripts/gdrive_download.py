"""
Download all files from a Google Drive shared folder in batches to avoid rate limiting.
Usage: python scripts/gdrive_download.py <folder_url> <output_dir>
"""

import os
import sys
import time
import re
import requests
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def get_folder_id(url: str) -> str:
    """Extract folder ID from Google Drive URL."""
    match = re.search(r'/folders/([a-zA-Z0-9_-]+)', url)
    if match:
        return match.group(1)
    raise ValueError(f"Could not extract folder ID from: {url}")


def list_files_in_folder(folder_id: str, api_key: str = None) -> list[dict]:
    """List all files in a Google Drive folder using the public API."""
    files = []
    page_token = None

    while True:
        params = {
            "q": f"'{folder_id}' in parents and trashed = false",
            "fields": "nextPageToken, files(id, name, mimeType, size)",
            "pageSize": 1000,
        }
        if api_key:
            params["key"] = api_key
        if page_token:
            params["pageToken"] = page_token

        resp = requests.get(
            "https://www.googleapis.com/drive/v3/files",
            params=params,
        )

        if resp.status_code != 200:
            print(f"API error: {resp.status_code} - {resp.text}")
            break

        data = resp.json()
        files.extend(data.get("files", []))

        page_token = data.get("nextPageToken")
        if not page_token:
            break

    return files


def list_subfolders(folder_id: str, api_key: str = None) -> list[dict]:
    """List subfolders in a Google Drive folder."""
    params = {
        "q": f"'{folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        "fields": "files(id, name)",
        "pageSize": 1000,
    }
    if api_key:
        params["key"] = api_key

    resp = requests.get("https://www.googleapis.com/drive/v3/files", params=params)
    if resp.status_code != 200:
        return []
    return resp.json().get("files", [])


def download_file(file_id: str, file_name: str, output_dir: str) -> bool:
    """Download a single file from Google Drive."""
    output_path = os.path.join(output_dir, file_name)

    if os.path.exists(output_path):
        print(f"  SKIP (exists): {file_name}")
        return True

    url = f"https://drive.google.com/uc?export=download&id={file_id}"

    session = requests.Session()
    resp = session.get(url, stream=True)

    # Handle download warning for large files
    for key, value in resp.cookies.items():
        if key.startswith("download_warning"):
            url = f"https://drive.google.com/uc?export=download&confirm={value}&id={file_id}"
            resp = session.get(url, stream=True)
            break

    if resp.status_code != 200:
        print(f"  FAIL: {file_name} (HTTP {resp.status_code})")
        return False

    # Check if we got HTML instead of the file (rate limited)
    content_type = resp.headers.get("Content-Type", "")
    if "text/html" in content_type:
        text = resp.text[:500]
        if "Too many users" in text or "quota" in text.lower() or "virus scan" in text.lower():
            print(f"  RATE LIMITED: {file_name} - waiting...")
            return False

    with open(output_path, "wb") as f:
        for chunk in resp.iter_content(chunk_size=32768):
            if chunk:
                f.write(chunk)

    size = os.path.getsize(output_path)
    if size < 100:  # Likely an error page
        os.remove(output_path)
        print(f"  FAIL (too small): {file_name}")
        return False

    print(f"  OK: {file_name} ({size:,} bytes)")
    return True


def download_folder_recursive(folder_id: str, output_dir: str, api_key: str = None, delay: float = 1.0):
    """Recursively download all files from a Drive folder."""
    os.makedirs(output_dir, exist_ok=True)

    # Download files in this folder
    files = list_files_in_folder(folder_id, api_key)
    non_folder_files = [f for f in files if f["mimeType"] != "application/vnd.google-apps.folder"]

    print(f"\nFound {len(non_folder_files)} files in folder")

    downloaded = 0
    skipped = 0
    failed = 0
    rate_limited = 0

    for i, f in enumerate(non_folder_files):
        file_name = f["name"]
        file_id = f["id"]

        # Skip Google Docs native formats
        if f["mimeType"].startswith("application/vnd.google-apps."):
            print(f"  SKIP (native): {file_name}")
            skipped += 1
            continue

        success = download_file(file_id, file_name, output_dir)
        if success:
            downloaded += 1
        else:
            # Rate limited - wait and retry
            rate_limited += 1
            if rate_limited <= 3:
                print(f"  Waiting 30s before retry...")
                time.sleep(30)
                success = download_file(file_id, file_name, output_dir)
                if success:
                    downloaded += 1
                    rate_limited -= 1
                else:
                    failed += 1
            else:
                failed += 1

        # Delay between downloads to avoid rate limiting
        if i < len(non_folder_files) - 1:
            time.sleep(delay)

        # Progress
        if (i + 1) % 10 == 0:
            print(f"  Progress: {i + 1}/{len(non_folder_files)} (OK: {downloaded}, Failed: {failed})")

    # Process subfolders
    subfolders = list_subfolders(folder_id, api_key)
    for sf in subfolders:
        sub_dir = os.path.join(output_dir, sf["name"])
        print(f"\n--- Entering subfolder: {sf['name']} ---")
        download_folder_recursive(sf["id"], sub_dir, api_key, delay)

    print(f"\nFolder complete: {downloaded} downloaded, {skipped} skipped, {failed} failed")


def main():
    folder_url = sys.argv[1] if len(sys.argv) > 1 else "https://drive.google.com/drive/folders/12r2gWIZ9Ru_Z7qlBFgQ1w_QmTMz3ZKQL"
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "../knowledge-base/cases"
    delay = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0

    folder_id = get_folder_id(folder_url)
    print(f"Downloading folder {folder_id} to {output_dir}")
    print(f"Delay between files: {delay}s")

    download_folder_recursive(folder_id, output_dir, delay=delay)


if __name__ == "__main__":
    main()
