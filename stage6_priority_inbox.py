from datetime import datetime
from heapq import heappush, heappushpop
from html import escape
from pathlib import Path
from urllib.error import HTTPError
import json
import base64
import sys
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageFont

from logging_middleware import Log


API_URL = "http://4.224.186.213/evaluation-service/notifications"
AUTH_URLS = [
    "http://4.224.186.213/evaluation-service/auth",
    "http://20.244.56.144/evaluation-service/auth",
]
ROOT_DIR = Path(__file__).resolve().parent
TOP_N = 10

TYPE_WEIGHT = {
    "Placement": 3,
    "Result": 2,
    "Event": 1,
}


def read_env_values():
    env_path = ROOT_DIR / ".env"
    if not env_path.exists():
        raise FileNotFoundError(".env file not found")

    values = {}
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        values[key.strip().strip('"')] = value.strip().strip('"')

    return values


def decode_jwt_payload(token):
    payload = token.split(".")[1]
    payload += "=" * (-len(payload) % 4)
    return json.loads(base64.urlsafe_b64decode(payload).decode("utf-8"))


def get_auth_payload(env_values):
    token_payload = decode_jwt_payload(env_values["access_token"])
    return {
        "email": token_payload.get("email"),
        "name": token_payload.get("name"),
        "rollNo": token_payload.get("rollNo"),
        "accessCode": token_payload.get("accessCode"),
        "clientID": env_values.get("clientID"),
        "clientSecret": env_values.get("clientSecret"),
    }


def refresh_access_token(env_values):
    payload = json.dumps(get_auth_payload(env_values)).encode("utf-8")

    for auth_url in AUTH_URLS:
        request = Request(
            auth_url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )

        try:
            Log("backend", "info", "stage6", f"Trying token refresh using {auth_url}")
            with urlopen(request, timeout=20) as response:
                response_body = response.read().decode("utf-8")
            parsed = json.loads(response_body)
            token = parsed.get("access_token") or parsed.get("accessToken")
            if token:
                Log("backend", "info", "stage6", "Token refresh successful")
                return token
        except HTTPError as error:
            Log("backend", "warn", "stage6", f"Token refresh failed with {error.code}")

    raise ValueError("Unable to refresh access token")


def parse_timestamp(value):
    return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")


def notification_priority(notification):
    notification_type = notification.get("Type", "")
    timestamp = parse_timestamp(notification["Timestamp"])
    return (
        TYPE_WEIGHT.get(notification_type, 0),
        timestamp.timestamp(),
    )


def request_notifications(token):
    request = Request(
        API_URL,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
        },
        method="GET",
    )

    with urlopen(request, timeout=20) as response:
        response_body = response.read().decode("utf-8")

    parsed = json.loads(response_body)
    return parsed.get("notifications", [])


def fetch_notifications():
    env_values = read_env_values()
    token = env_values.get("access_token")
    if not token:
        raise ValueError("access_token not found in .env")

    Log("backend", "info", "stage6", "Fetching notifications from evaluation API")

    try:
        notifications = request_notifications(token)
    except HTTPError as error:
        if error.code != 401:
            raise

        Log("backend", "warn", "stage6", "Saved token rejected, refreshing token")
        token = refresh_access_token(env_values)
        notifications = request_notifications(token)

    Log("backend", "info", "stage6", f"Fetched {len(notifications)} notifications")
    return notifications


def find_top_notifications(notifications, top_n=TOP_N):
    heap = []

    for notification in notifications:
        try:
            priority = notification_priority(notification)
        except (KeyError, ValueError) as error:
            Log("backend", "warn", "stage6", f"Skipping invalid notification: {error}")
            continue

        item = (priority[0], priority[1], notification.get("ID", ""), notification)

        if len(heap) < top_n:
            heappush(heap, item)
        else:
            heappushpop(heap, item)

    top_items = sorted(heap, key=lambda row: (row[0], row[1]), reverse=True)
    return [item[3] for item in top_items]


def score_label(notification):
    weight, recency_score = notification_priority(notification)
    return f"type_weight={weight}, recency={int(recency_score)}"


def write_html_output(top_notifications):
    rows = []
    for index, notification in enumerate(top_notifications, start=1):
        rows.append(
            "<tr>"
            f"<td>{index}</td>"
            f"<td>{escape(notification.get('Type', ''))}</td>"
            f"<td>{escape(notification.get('Message', ''))}</td>"
            f"<td>{escape(notification.get('Timestamp', ''))}</td>"
            f"<td>{escape(score_label(notification))}</td>"
            f"<td>{escape(notification.get('ID', ''))}</td>"
            "</tr>"
        )

    html = f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Stage 6 Priority Inbox Output</title>
  <style>
    body {{
      font-family: Arial, sans-serif;
      margin: 32px;
      color: #1f2937;
      background: #f7f7f4;
    }}
    h1 {{
      margin: 0 0 8px;
      font-size: 26px;
    }}
    p {{
      margin: 0 0 20px;
      color: #4b5563;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      background: white;
      border: 1px solid #d9d9d2;
    }}
    th, td {{
      padding: 10px 12px;
      border-bottom: 1px solid #e6e6df;
      text-align: left;
      font-size: 14px;
      vertical-align: top;
    }}
    th {{
      background: #0f766e;
      color: white;
      font-weight: 600;
    }}
    tr:nth-child(even) {{
      background: #f9fafb;
    }}
    .rank {{
      font-weight: 700;
    }}
  </style>
</head>
<body>
  <h1>Stage 6 Priority Inbox - Top 10</h1>
  <p>Priority is sorted by notification type weight first, then latest timestamp.</p>
  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Type</th>
        <th>Message</th>
        <th>Timestamp</th>
        <th>Score</th>
        <th>ID</th>
      </tr>
    </thead>
    <tbody>
      {''.join(rows)}
    </tbody>
  </table>
</body>
</html>
"""
    output_path = ROOT_DIR / "stage6_priority_output.html"
    output_path.write_text(html, encoding="utf-8")
    Log("backend", "info", "stage6", f"Wrote HTML output to {output_path.name}")
    return output_path


def load_font(size, bold=False):
    font_names = ["arialbd.ttf" if bold else "arial.ttf", "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"]
    for font_name in font_names:
        try:
            return ImageFont.truetype(font_name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def write_png_output(top_notifications):
    width = 1500
    row_height = 58
    header_height = 132
    footer_height = 32
    height = header_height + row_height * (len(top_notifications) + 1) + footer_height

    image = Image.new("RGB", (width, height), "#f7f7f4")
    draw = ImageDraw.Draw(image)

    title_font = load_font(30, bold=True)
    normal_font = load_font(18)
    small_font = load_font(15)
    header_font = load_font(17, bold=True)

    draw.text((32, 28), "Stage 6 Priority Inbox - Top 10", fill="#111827", font=title_font)
    draw.text(
        (32, 72),
        "Priority = notification type weight first, then latest timestamp",
        fill="#4b5563",
        font=normal_font,
    )

    table_x = 32
    table_y = 112
    columns = [
        ("Rank", 70),
        ("Type", 130),
        ("Message", 360),
        ("Timestamp", 210),
        ("Score", 250),
        ("ID", 410),
    ]

    draw.rectangle((table_x, table_y, width - 32, table_y + row_height), fill="#0f766e")

    x = table_x
    for label, col_width in columns:
        draw.text((x + 10, table_y + 18), label, fill="white", font=header_font)
        x += col_width

    y = table_y + row_height
    for index, notification in enumerate(top_notifications, start=1):
        fill = "white" if index % 2 else "#f9fafb"
        draw.rectangle((table_x, y, width - 32, y + row_height), fill=fill, outline="#e6e6df")

        values = [
            str(index),
            notification.get("Type", ""),
            notification.get("Message", ""),
            notification.get("Timestamp", ""),
            score_label(notification),
            notification.get("ID", ""),
        ]

        x = table_x
        for value, (_, col_width) in zip(values, columns):
            draw.text((x + 10, y + 18), value[:44], fill="#1f2937", font=small_font)
            x += col_width

        y += row_height

    output_path = ROOT_DIR / "stage6_priority_output.png"
    image.save(output_path)
    Log("backend", "info", "stage6", f"Wrote PNG screenshot to {output_path.name}")
    return output_path


def format_console_output(top_notifications):
    lines = ["Stage 6 Priority Inbox - Top 10", ""]
    for index, notification in enumerate(top_notifications, start=1):
        lines.append(
            f"{index}. {notification['Type']} | {notification['Timestamp']} | "
            f"{notification['Message']} | {notification['ID']}"
        )
    return "\n".join(lines)


def main():
    try:
        notifications = fetch_notifications()
        top_notifications = find_top_notifications(notifications, TOP_N)
        write_html_output(top_notifications)
        write_png_output(top_notifications)
        Log("backend", "info", "stage6", "Top 10 priority notifications calculated")
        sys.stdout.write(format_console_output(top_notifications))
        sys.stdout.write("\n")
    except Exception as error:
        Log("backend", "error", "stage6", f"Stage 6 failed: {error}")
        raise


if __name__ == "__main__":
    main()
