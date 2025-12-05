"""
Simple HTTP Server for KindyGuard Demo
Run this script and open http://localhost:8000/KindyGuard_Demo.html
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

# Change to the directory containing this script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

# Add MIME type for mp4
Handler.extensions_map.update({
    '.mp4': 'video/mp4',
})

print("=" * 50)
print("KindyGuard Demo Server")
print("=" * 50)
print(f"Server running at: http://localhost:{PORT}")
print(f"Open: http://localhost:{PORT}/KindyGuard_Demo.html")
print("Press Ctrl+C to stop")
print("=" * 50)

# Auto open browser
webbrowser.open(f'http://localhost:{PORT}/KindyGuard_Demo.html')

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
