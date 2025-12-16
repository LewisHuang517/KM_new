"""
Simple HTTP Server for KindyGuard Demo
Run this script and open http://localhost:8000/index.html
"""

import http.server
import socketserver
import webbrowser
import os
import socket

PORT = 8000

def get_local_ip():
    """取得本機區網 IP 地址"""
    try:
        # 建立一個 UDP socket 來取得本機 IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "無法取得"

# Change to the directory containing this script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

# Add MIME types
Handler.extensions_map.update({
    '.mp4': 'video/mp4',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
})

local_ip = get_local_ip()

print("=" * 50)
print("KindyGuard Demo Server")
print("=" * 50)
print(f"本機: http://localhost:{PORT}/index.html")
print(f"區網: http://{local_ip}:{PORT}/index.html")
print("-" * 50)
print("分享上方「區網」網址給同區網的使用者即可連線")
print("按 Ctrl+C 停止伺服器")
print("=" * 50)

# Auto open browser
webbrowser.open(f'http://localhost:{PORT}/index.html')

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
