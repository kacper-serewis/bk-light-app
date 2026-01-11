def build_frame(png_bytes: bytes) -> bytes:
    data_length = len(png_bytes)
    total_length = data_length + 15
    frame = bytearray()
    frame += total_length.to_bytes(2, "little")
    frame.append(0x02)
    frame += b"\x00\x00"
    frame += data_length.to_bytes(2, "little")
    frame += b"\x00\x00"
    frame += binascii.crc32(png_bytes).to_bytes(4, "little")
    frame += b"\x00\x65"
    frame += png_bytes
    return bytes(frame)


if __name__ == "__main__":
    import base64
    png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADklEQVR4nGP4z8DAwAAABQABf6XWDAAAAABJRU5ErkJggg=="
    png_bytes = base64.b64decode(png_base64)
    frame = build_frame(png_bytes)
    print(f"Frame length: {len(frame)}")
    print(f"Frame: {'-'.join(f'{b:02x}' for b in frame)}")
