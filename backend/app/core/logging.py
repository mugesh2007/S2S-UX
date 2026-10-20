import logging
import sys
from typing import Any, Dict


def setup_logging(debug: bool = False) -> logging.Logger:
    """Configures application-wide structured logging."""
    log_level = logging.DEBUG if debug else logging.INFO

    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger("s2s")
    root_logger.setLevel(log_level)
    root_logger.handlers = [handler]
    root_logger.propagate = False

    return root_logger


logger = setup_logging()
