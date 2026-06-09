from datetime import datetime, timezone
from pathlib import Path


def Log(stack, level, package, message):
    log_dir = Path(__file__).resolve().parent.parent / "logs"
    log_dir.mkdir(exist_ok=True)

    line = (
        f"{datetime.now(timezone.utc).isoformat()} "
        f"| stack={stack} | level={level} | package={package} | {message}\n"
    )

    with (log_dir / "stage6.log").open("a", encoding="utf-8") as log_file:
        log_file.write(line)

