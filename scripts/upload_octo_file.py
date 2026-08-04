#!/usr/bin/env python3
"""Upload PDF to Octo and send file message to group chat."""
import json
import os
import requests
import sys
from pathlib import Path

# Config
API_URL = "https://im.deepminer.com.cn/api"
BOT_TOKEN = "bf_717f9121c6698a51b4fa1f0b7f47ac23"
GROUP_ID = "f4b0b224e7ba40e690a2a6087713a392"
PDF_PATH = Path(__file__).resolve().parent.parent / "zpsj-threshold-spec-v5.pdf"

# Step 1: Get presigned URL
file_size = PDF_PATH.stat().st_size
filename = "像素方案阈值说明-v5.pdf"

print(f"Uploading {filename} ({file_size} bytes)...")

resp = requests.get(
    f"{API_URL}/v1/bot/upload/presigned",
    params={"filename": filename, "fileSize": file_size},
    headers={"Authorization": f"Bearer {BOT_TOKEN}"}
)
print(f"Presigned response: {resp.status_code}")
if resp.status_code != 200:
    print(resp.text)
    sys.exit(1)

upload_data = resp.json()
print(f"Got upload URL: {upload_data['uploadUrl'][:80]}...")

# Step 2: PUT file to storage
with open(PDF_PATH, 'rb') as f:
    file_data = f.read()

headers = {}
if 'contentType' in upload_data:
    headers['Content-Type'] = upload_data['contentType']
if 'contentDisposition' in upload_data:
    headers['Content-Disposition'] = upload_data['contentDisposition']

put_resp = requests.put(
    upload_data['uploadUrl'],
    data=file_data,
    headers=headers
)
print(f"Upload PUT: {put_resp.status_code}")
if put_resp.status_code not in (200, 204):
    print(put_resp.text[:500])
    sys.exit(1)

download_url = upload_data['downloadUrl']
print(f"Download URL: {download_url}")

# Step 3: Send file message to group
send_resp = requests.post(
    f"{API_URL}/v1/bot/sendMessage",
    headers={
        "Authorization": f"Bearer {BOT_TOKEN}",
        "Content-Type": "application/json"
    },
    json={
        "channel_id": GROUP_ID,
        "channel_type": 2,
        "payload": {
            "type": 8,
            "url": download_url,
            "name": filename,
            "size": file_size
        }
    }
)
print(f"Send message: {send_resp.status_code}")
if send_resp.status_code in (200, 201):
    print("File sent successfully!")
else:
    print(send_resp.text[:500])
