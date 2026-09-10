from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

TEMPLATE_DIR = Path(__file__).parent / "templates"

_env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(["html"]),
    trim_blocks=True,
    lstrip_blocks=True,
)


def render(template: str, context: dict[str, Any]) -> tuple[str, str]:
    html = _env.get_template(f"{template}.html.j2").render(**context)
    text = _env.get_template(f"{template}.txt.j2").render(**context)
    return html, text
