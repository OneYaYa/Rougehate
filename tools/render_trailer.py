"""Render the deterministic 14-second ROUGE HATE gameplay trailer.

The browser footage is genuine Canvas gameplay driven by `?trailer=1`. Music is
generated locally so the exported promo contains no third-party copyrighted
audio. Run from the repository root with `.trailer_tools` on PYTHONPATH.
"""

from __future__ import annotations

import json
import math
import os
from pathlib import Path
import random
import subprocess
import sys
import time
import urllib.request
import wave

import numpy as np
from imageio_ffmpeg import get_ffmpeg_exe
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "trailer-output"
RAW = OUTPUT / "raw" / time.strftime("%Y%m%d-%H%M%S")
PORT = 8798
DURATION = 14.18
SAMPLE_RATE = 48_000
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")


def wait_for_server(timeout: float = 12.0) -> None:
    deadline = time.time() + timeout
    url = f"http://127.0.0.1:{PORT}/api/health"
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=1) as response:
                if json.load(response).get("ok"):
                    return
        except Exception:
            time.sleep(0.12)
    raise RuntimeError("Trailer server did not become ready")


def add_tone(track: np.ndarray, start: float, duration: float, frequency: float,
             amplitude: float, decay: float = 3.0, pan: float = 0.0,
             harmonics: tuple[float, ...] = (1.0,)) -> None:
    begin = max(0, int(start * SAMPLE_RATE))
    count = min(len(track) - begin, int(duration * SAMPLE_RATE))
    if count <= 0:
        return
    t = np.arange(count, dtype=np.float64) / SAMPLE_RATE
    envelope = np.exp(-decay * t / max(duration, 1e-4))
    attack = np.minimum(1.0, t / .008)
    signal = np.zeros(count, dtype=np.float64)
    for index, strength in enumerate(harmonics, start=1):
        signal += strength * np.sin(2 * math.pi * frequency * index * t)
    signal *= amplitude * envelope * attack / max(1.0, sum(abs(x) for x in harmonics))
    left = math.sqrt((1 - max(-1.0, min(1.0, pan))) * .5)
    right = math.sqrt((1 + max(-1.0, min(1.0, pan))) * .5)
    track[begin:begin + count, 0] += signal * left
    track[begin:begin + count, 1] += signal * right


def add_kick(track: np.ndarray, at: float, amplitude: float = .72) -> None:
    duration = .34
    begin = int(at * SAMPLE_RATE)
    count = min(len(track) - begin, int(duration * SAMPLE_RATE))
    if count <= 0:
        return
    t = np.arange(count, dtype=np.float64) / SAMPLE_RATE
    phase = 2 * math.pi * (42 * t + (95 - 42) * (1 - np.exp(-22 * t)) / 22)
    signal = np.sin(phase) * np.exp(-15 * t) * amplitude
    signal += np.sin(2 * math.pi * 170 * t) * np.exp(-60 * t) * amplitude * .18
    track[begin:begin + count] += signal[:, None] * np.array([.70, .70])


def add_noise(track: np.ndarray, at: float, duration: float, amplitude: float,
              decay: float = 18.0, pan: float = 0.0, seed: int = 0) -> None:
    begin = max(0, int(at * SAMPLE_RATE))
    count = min(len(track) - begin, int(duration * SAMPLE_RATE))
    if count <= 0:
        return
    rng = np.random.default_rng(seed)
    t = np.arange(count, dtype=np.float64) / SAMPLE_RATE
    noise = rng.normal(0, 1, count)
    # A cheap high-pass: subtract a one-pole smoothed copy.
    smooth = np.cumsum(noise)
    window = 18
    smooth[window:] = (smooth[window:] - smooth[:-window]) / window
    smooth[:window] /= np.arange(1, window + 1)
    signal = (noise - smooth) * np.exp(-decay * t) * amplitude
    left = math.sqrt((1 - pan) * .5)
    right = math.sqrt((1 + pan) * .5)
    track[begin:begin + count, 0] += signal * left
    track[begin:begin + count, 1] += signal * right


def add_riser(track: np.ndarray, start: float, duration: float, amplitude: float, seed: int) -> None:
    begin = int(start * SAMPLE_RATE)
    count = min(len(track) - begin, int(duration * SAMPLE_RATE))
    if count <= 0:
        return
    rng = np.random.default_rng(seed)
    t = np.arange(count, dtype=np.float64) / SAMPLE_RATE
    ratio = t / max(duration, .01)
    noise = rng.normal(0, 1, count)
    carrier = np.sin(2 * math.pi * (180 * t + 960 * t * ratio * ratio))
    signal = (noise * .22 + carrier * .78) * np.power(ratio, 1.7) * amplitude
    signal *= np.minimum(1.0, (duration - t) / .06)
    pan = np.sin(t * 4.3) * .45
    track[begin:begin + count, 0] += signal * np.sqrt((1 - pan) * .5)
    track[begin:begin + count, 1] += signal * np.sqrt((1 + pan) * .5)


def build_soundtrack(path: Path) -> None:
    frames = int((DURATION + .12) * SAMPLE_RATE)
    track = np.zeros((frames, 2), dtype=np.float64)
    rng = random.Random(7127)
    bpm = 160
    beat = 60 / bpm

    # Low cosmic bed and sparse intro pulse.
    add_tone(track, 0, 12.8, 36.71, .12, .42, harmonics=(1, .35, .16))
    add_tone(track, 0, 7.25, 73.42, .055, .5, pan=-.2, harmonics=(1, .22))
    for step in np.arange(0, 7.28, beat):
        add_kick(track, float(step), .36 if step < 3.7 else .48)
        if int(round(step / beat)) % 2:
            add_noise(track, float(step), .14, .095, seed=rng.randrange(10_000))

    # Build-up to the typed weapon wish.
    add_riser(track, 4.65, 2.63, .20, 41)
    for at in [1.86, 3.78, 5.18]:
        add_tone(track, at, .8, 49, .42, 4.8, harmonics=(1, .5, .22))
        add_noise(track, at, .48, .18, 7.5, seed=int(at * 1000))

    # The drop: four-on-the-floor, syncopated bass, hats and a bright arpeggio.
    notes = [36.71, 43.65, 32.70, 49.00]
    arp = [146.83, 174.61, 220.00, 261.63, 220.00, 174.61]
    drop_start = 7.28
    step = beat / 2
    index = 0
    at = drop_start
    while at < 12.72:
        beat_index = int((at - drop_start) / beat + 1e-5)
        if index % 2 == 0:
            add_kick(track, at, .82)
        else:
            add_noise(track, at, .075, .10, 30, pan=(-.45 if index % 4 == 1 else .45), seed=9000 + index)
        if beat_index % 4 in (1, 3) and index % 2 == 0:
            add_noise(track, at, .22, .22, 14, seed=12000 + index)
        add_tone(track, at, step * .92, notes[(index // 2) % len(notes)], .24, 3.0,
                 pan=(-.12 if index % 4 < 2 else .12), harmonics=(1, .45, .21))
        add_tone(track, at, step * .68, arp[index % len(arp)], .11, 5.2,
                 pan=math.sin(index * 1.7) * .62, harmonics=(1, .34, .12))
        at += step
        index += 1

    # Whooshes and impacts match the three build cuts and the end card.
    for number, at in enumerate([7.28, 9.05, 10.82, 12.72]):
        add_riser(track, max(0, at - .38), .38, .17, 200 + number)
        add_tone(track, at, 1.0, 38 if at < 12 else 31, .72, 5.2, harmonics=(1, .5, .25))
        add_noise(track, at, .55, .28, 8.5, seed=300 + number)

    # Logo hold: one resolved synthetic chord, then a clean tail.
    for frequency, pan in [(73.42, -.35), (110.0, 0), (146.83, .35), (220.0, .12)]:
        add_tone(track, 12.73, 1.45, frequency, .13, 1.45, pan=pan, harmonics=(1, .28, .08))

    fade_start = int(13.75 * SAMPLE_RATE)
    track[fade_start:] *= np.linspace(1, 0, len(track) - fade_start)[:, None]
    # Gentle saturation and normalization make the tiny synth feel trailer-sized.
    track = np.tanh(track * 1.32)
    peak = float(np.max(np.abs(track))) or 1
    # Leave true-peak room for AAC and social-platform transcoding.
    track *= .82 / peak
    pcm = np.int16(np.clip(track, -1, 1) * 32767)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(pcm.tobytes())


def record_gameplay() -> Path:
    if not CHROME.exists():
        raise FileNotFoundError(f"Chrome not found: {CHROME}")
    env = os.environ.copy()
    env["ROUGEHATE_PORT"] = str(PORT)
    env["OPENAI_API_KEY"] = " "  # deterministic local compiler; no API cost
    log_path = RAW / "server.log"
    with log_path.open("w", encoding="utf-8") as log:
        server = subprocess.Popen(
            [sys.executable, "server.py"], cwd=ROOT, env=env,
            stdout=log, stderr=subprocess.STDOUT,
        )
        try:
            wait_for_server()
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(
                    executable_path=str(CHROME), headless=True,
                    args=[
                        "--hide-scrollbars", "--force-device-scale-factor=1",
                        "--disable-background-timer-throttling",
                        "--disable-renderer-backgrounding",
                        "--disable-backgrounding-occluded-windows",
                    ],
                )
                context = browser.new_context(
                    viewport={"width": 1280, "height": 720},
                    device_scale_factor=1,
                    record_video_dir=str(RAW),
                    record_video_size={"width": 1280, "height": 720},
                )
                page = context.new_page()
                video = page.video
                page.goto(f"http://127.0.0.1:{PORT}/?trailer=1", wait_until="networkidle")
                deadline = time.time() + 25
                while time.time() < deadline:
                    if page.locator("html").get_attribute("data-trailer-complete") == "1":
                        break
                    page.wait_for_timeout(100)
                else:
                    raise TimeoutError("Trailer director mode did not reach the end card")
                bad_damage = page.locator("html").get_attribute("data-trailer-bad-damage")
                if bad_damage:
                    raise RuntimeError(f"Non-finite combat damage during capture: {bad_damage}")
                page.wait_for_timeout(220)
                context.close()
                raw_path = Path(video.path())
                browser.close()
                return raw_path
        finally:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()


def mux_video(raw_video: Path, soundtrack: Path, destination: Path) -> None:
    ffmpeg = get_ffmpeg_exe()
    command = [
        ffmpeg, "-y", "-ss", "0.68", "-i", str(raw_video), "-i", str(soundtrack),
        "-t", str(DURATION), "-map", "0:v:0", "-map", "1:a:0",
        # Playwright records a short navigation pre-roll before director mode
        # starts. The input seek above removes it; pad the final logo hold and
        # force constant 25 fps so H.264 level metadata remains standards-safe.
        "-vf", (
            "tpad=stop_mode=clone:stop_duration=0.68,"
            "scale=1920:1080:flags=lanczos,fps=25"
        ),
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1",
        "-c:a", "aac", "-b:a", "192k", "-ar", str(SAMPLE_RATE),
        "-movflags", "+faststart", str(destination),
    ]
    subprocess.run(command, cwd=ROOT, check=True)


def main() -> None:
    OUTPUT.mkdir(exist_ok=True)
    RAW.mkdir(parents=True, exist_ok=True)
    soundtrack = RAW / "original-soundtrack.wav"
    destination = OUTPUT / "rouge-hate-trailer-14s-final.mp4"
    print("[1/3] Generating original soundtrack...")
    build_soundtrack(soundtrack)
    print("[2/3] Recording real-time browser gameplay...")
    raw_video = record_gameplay()
    print("[3/3] Encoding H.264 promotional master...")
    mux_video(raw_video, soundtrack, destination)
    print(destination.resolve())


if __name__ == "__main__":
    main()
