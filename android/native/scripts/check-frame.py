"""Reject a blank browser surface even if accessibility exposes its DOM."""
import json
import pathlib
import struct
import sys


def inspect_frame(data):
    width, height, pixel_format = struct.unpack_from('<III', data)
    assert 100 <= width <= 5000 and 200 <= height <= 5000
    assert pixel_format in (1, 2), f'Expected RGBA/RGBX screenshot, got {pixel_format}'
    offset = len(data) - width * height * 4
    assert offset in (12, 16), f'Unexpected screencap header: {offset}'
    # Exclude Android/Chrome bars and the translation bubble above the page.
    left, right = width // 20, width * 19 // 20
    top, bottom = height * 28 // 100, height * 90 // 100
    colored = total = 0
    for y in range(top, bottom):
        start = offset + (y * width + left) * 4
        row = memoryview(data)[start:start + (right - left) * 4]
        for x in range(0, len(row), 4):
            colored += min(row[x:x + 3]) < 230
            total += 1
    fraction = colored / total
    return {'width': width, 'height': height,
            'contentNonwhiteFraction': round(fraction, 4),
            'visibleContent': fraction >= 0.02}


if __name__ == '__main__':
    result = inspect_frame(pathlib.Path(sys.argv[1]).read_bytes())
    print(json.dumps(result))
    sys.exit(0 if result['visibleContent'] else 1)
