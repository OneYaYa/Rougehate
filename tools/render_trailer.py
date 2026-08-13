"""Render the deterministic ROUGE HATE gameplay trailer.

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
import re
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
DURATION = 49.22
SAMPLE_RATE = 48_000
OUTPUT_FPS = 25
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


def add_keypress(track: np.ndarray, at: float, index: int, punctuation: bool = False) -> None:
    """Layer a dry key-down and key-return click for the on-screen wish."""
    pan = (-.22, .18, -.08, .25)[index % 4]
    strength = .072 if punctuation else .047
    add_noise(track, at, .038 if punctuation else .027, strength, 92,
              pan=pan, seed=6100 + index)
    add_tone(track, at, .032, 760 + (index % 5) * 54, .018, 68,
             pan=pan, harmonics=(1, .3))
    add_noise(track, at + .034, .025, strength * .46, 105,
              pan=-pan * .6, seed=6400 + index)
    if punctuation:
        add_tone(track, at, .075, 245, .026, 30, pan=pan, harmonics=(1, .42))


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
    frames = int((DURATION + .18) * SAMPLE_RATE)
    track = np.zeros((frames, 2), dtype=np.float64)
    rng = random.Random(7127)
    bass_notes = [36.71, 43.65, 32.70, 49.00]
    arp_notes = [146.83, 174.61, 220.00, 261.63, 220.00, 174.61]

    # A continuous sub-bed glues the four narrative chapters together.
    add_tone(track, 0, 46.0, 36.71, .09, .16, harmonics=(1, .35, .16))
    add_tone(track, 3.0, 43.0, 73.42, .038, .15, pan=-.18, harmonics=(1, .22))

    def rhythm(start: float, end: float, bpm: float, intensity: float,
               bright: float = 0.0, double_kick: bool = False) -> None:
        beat = 60 / bpm
        step = beat / 2
        index = 0
        at = start
        while at < end:
            on_beat = index % 2 == 0
            if on_beat or (double_kick and index % 4 == 3):
                add_kick(track, at, intensity * (1.0 if on_beat else .58))
            else:
                add_noise(track, at, .075, intensity * .11, 30,
                          pan=(-.46 if index % 4 == 1 else .46), seed=rng.randrange(100_000))
            if on_beat and (index // 2) % 2 == 1:
                add_noise(track, at, .22, intensity * .24, 14, seed=rng.randrange(100_000))
            add_tone(track, at, step * .92, bass_notes[(index // 2) % len(bass_notes)],
                     intensity * .25, 3.0, pan=(-.12 if index % 4 < 2 else .12),
                     harmonics=(1, .45, .21))
            if bright > 0:
                add_tone(track, at, step * .7, arp_notes[index % len(arp_notes)],
                         bright, 5.2, pan=math.sin(index * 1.7) * .62,
                         harmonics=(1, .34, .12))
            at += step
            index += 1

    # 0–3.00: open at the payoff with an immediate, compact hook.
    rhythm(0, 3.0, 156, .78, .085, True)

    # 3.00–6.15: identity compiler — half-time pulse leaves room to read.
    rhythm(3.0, 6.15, 104, .32, .018)
    for index, at in enumerate(np.arange(3.24, 6.0, .58)):
        add_noise(track, float(at), .055, .055, 38, pan=(-.5 if index % 2 else .5), seed=4100 + index)

    # 6.15–10.50: early-run movement finds a steady groove.
    rhythm(6.15, 10.5, 140, .56, .055)

    # 10.50–13.65: the patron roster opens and one readable boon lands.
    for frequency, pan in [(73.42, -.35), (110.0, 0), (146.83, .35)]:
        add_tone(track, 10.5, 2.95, frequency, .09, 1.0, pan=pan, harmonics=(1, .28, .08))
    for at in [10.95, 11.75, 12.65, 13.35]:
        add_noise(track, at, .08, .055, 34, seed=int(at * 1000))

    # 13.65–17.80: staggered packs cut across the escape route while the
    # player keeps moving, then the forge interrupts the final collision.
    rhythm(13.65, 17.7, 120, .43, .022)
    for index, at in enumerate(np.arange(15.2, 17.72, .42)):
        add_kick(track, float(at), .46 + index * .035)
        add_noise(track, float(at), .13, .06 + index * .009, 20,
                  pan=(-.38 if index % 2 else .38), seed=4700 + index)
    add_riser(track, 16.38, 1.42, .2, 480)

    # 17.80–25.15: every visible character has a synchronized mechanical
    # keypress; punctuation lands with a slightly heavier confirmation click.
    wish_text = "八颗幼星主动追猎，贯穿折返，沿途孵化雷暴。"
    typing_start = 18.32
    typing_duration = 3.45
    for index, character in enumerate(wish_text):
        at = typing_start + index / len(wish_text) * typing_duration
        add_keypress(track, at, index, character in "，。；！？")
    add_tone(track, 17.8, 4.9, 110.0, .045, .48, harmonics=(1, .25, .08))
    add_riser(track, 21.52, 1.18, .18, 601)
    for frequency, pan in [(98.0, -.3), (146.83, .1), (196.0, .35)]:
        add_tone(track, 22.7, 2.2, frequency, .12, 1.7, pan=pan, harmonics=(1, .3, .1))

    # 25.15–31.05: the full drop pays off the generated weapon's comeback.
    rhythm(25.15, 31.05, 158, .86, .11, True)

    # 31.05–34.35: weapon evolution returns to half-time without losing tension.
    rhythm(31.05, 34.35, 108, .35, .028)
    add_riser(track, 31.92, 2.43, .18, 702)
    # Three hard diagnostic locks follow the visible SCAN / DECOMPOSE / LOCK
    # rail in the dedicated AI weapon blueprint ceremony.
    for index, at in enumerate((32.98, 33.31, 33.64)):
        add_noise(track, at, .055, .082, 62, pan=(-.34, 0, .34)[index], seed=720 + index)
        add_tone(track, at, .16, (310, 465, 698)[index], .048, 12,
                 pan=(-.34, 0, .34)[index], harmonics=(1, .3))

    # 34.35–46.00: three late-game builds escalate without interrupting the drop.
    rhythm(34.35, 46.00, 168, .94, .13, True)
    add_tone(track, 36.0, 2.05, 55.0, .08, .35, harmonics=(1, .5, .22))
    add_tone(track, 38.15, 3.55, 82.41, .075, .42, pan=-.22, harmonics=(1, .42, .2))
    add_tone(track, 42.0, 3.72, 49.0, .09, .38, pan=.2, harmonics=(1, .52, .24))

    # Each visual chapter lands on a distinct impact; the last one opens the CTA.
    cut_points = [3.0, 6.15, 10.5, 11.75, 13.65, 16.25, 17.8, 22.7, 25.15, 31.05, 34.35, 38.15, 42.0, 46.0]
    for number, at in enumerate(cut_points):
        if at not in (22.7,):
            add_riser(track, max(0, at - .34), .34, .115 if at < 21 else .16, 800 + number)
        add_tone(track, at, .92, 39 if at < 29 else 31, .48 if at < 29 else .72,
                 5.4, harmonics=(1, .5, .25))
        add_noise(track, at, .48, .20 if at < 29 else .29, 8.5, seed=900 + number)

    # Logo hold: resolved synthetic chord and a clean social-platform-safe tail.
    for frequency, pan in [(73.42, -.38), (110.0, -.08), (146.83, .32), (220.0, .12)]:
        add_tone(track, 46.01, 3.0, frequency, .12, 1.1, pan=pan, harmonics=(1, .28, .08))

    fade_start = int(48.55 * SAMPLE_RATE)
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
                        "--use-angle=d3d11",
                        "--enable-gpu-rasterization",
                        "--enable-zero-copy",
                        "--ignore-gpu-blocklist",
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
                deadline = time.time() + DURATION + 15
                while time.time() < deadline:
                    if page.locator("html").get_attribute("data-trailer-complete") == "1":
                        break
                    page.wait_for_timeout(100)
                else:
                    raise TimeoutError("Trailer director mode did not reach the end card")
                bad_damage = page.locator("html").get_attribute("data-trailer-bad-damage")
                if bad_damage:
                    raise RuntimeError(f"Non-finite combat damage during capture: {bad_damage}")
                max_frame_gap = float(page.locator("html").get_attribute("data-trailer-max-frame-gap") or 0)
                slow_frames = int(page.locator("html").get_attribute("data-trailer-slow-frames") or 0)
                slowest_frames = json.loads(page.locator("html").get_attribute("data-trailer-slowest-frames") or "[]")
                slow_frames_by_window = json.loads(page.locator("html").get_attribute("data-trailer-slow-frames-by-window") or "{}")
                print(f"    frame audit: max gap {max_frame_gap:.1f} ms, {slow_frames} frames over 52 ms")
                if slowest_frames:
                    slowest = ", ".join(f"{item['at']:.2f}s/{item['gap']:.0f}ms" for item in slowest_frames)
                    print(f"    slowest frames: {slowest}")
                if slow_frames_by_window:
                    windows = ", ".join(f"{window}s={count}" for window, count in slow_frames_by_window.items())
                    print(f"    slow frames by window: {windows}")
                if max_frame_gap > 240:
                    raise RuntimeError(f"Capture renderer stalled for {max_frame_gap:.1f} ms")
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


def detect_capture_inpoint(raw_video: Path) -> float:
    """Find the end of the stable black warm-up after the recorder settles."""
    ffmpeg = get_ffmpeg_exe()
    completed = subprocess.run([
        ffmpeg, "-hide_banner", "-nostats", "-i", str(raw_video),
        "-vf", "blackdetect=d=0.25:pix_th=0.07:pic_th=0.85",
        "-an", "-f", "null", os.devnull,
    ], cwd=ROOT, text=True, capture_output=True, check=False)
    matches = [
        (float(start), float(end), float(duration))
        for start, end, duration in re.findall(
            r"black_start:([\d.]+)\s+black_end:([\d.]+)\s+black_duration:([\d.]+)",
            completed.stderr,
        )
    ]
    candidates = [
        item for item in matches
        if item[0] <= .5 and .6 <= item[1] <= 3.0 and item[2] >= .5
    ]
    if not candidates:
        raise RuntimeError("Could not locate the stable black capture warm-up")
    start, end, duration = max(candidates, key=lambda item: item[2])
    print(f"    capture in-point: {end:.3f}s (black warm-up {start:.3f}–{end:.3f}s)")
    return end


def mux_video(raw_video: Path, soundtrack: Path, destination: Path) -> None:
    ffmpeg = get_ffmpeg_exe()
    capture_inpoint = detect_capture_inpoint(raw_video)
    command = [
        ffmpeg, "-y", "-ss", f"{capture_inpoint:.3f}", "-i", str(raw_video), "-i", str(soundtrack),
        "-t", str(DURATION), "-map", "0:v:0", "-map", "1:a:0",
        "-vf", (
            "setpts=PTS-STARTPTS,"
            f"scale=1920:1080:flags=lanczos,fps={OUTPUT_FPS}"
        ),
        "-c:v", "libx264", "-preset", "slow", "-crf", "14",
        "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
        # Synthetic transients produce sizeable AAC inter-sample overshoot;
        # the conservative pre-encode ceiling keeps the delivery master safe.
        "-filter:a", "loudnorm=I=-16:LRA=7:TP=-4.5",
        "-c:a", "aac", "-b:a", "192k", "-ar", str(SAMPLE_RATE),
        "-movflags", "+faststart", str(destination),
    ]
    subprocess.run(command, cwd=ROOT, check=True)


def build_preview(source: Path, destination: Path) -> None:
    """Build the lightweight looping README preview from the final master."""
    ffmpeg = get_ffmpeg_exe()
    destination.parent.mkdir(parents=True, exist_ok=True)
    filter_graph = (
        "fps=6,scale=560:-1:flags=lanczos,split[s0][s1];"
        "[s0]palettegen=max_colors=96:stats_mode=diff[p];"
        "[s1][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle"
    )
    subprocess.run([
        ffmpeg, "-y", "-i", str(source), "-vf", filter_graph,
        "-loop", "0", str(destination),
    ], cwd=ROOT, check=True)


def main() -> None:
    OUTPUT.mkdir(exist_ok=True)
    RAW.mkdir(parents=True, exist_ok=True)
    soundtrack = RAW / "original-soundtrack.wav"
    destination = OUTPUT / "rouge-hate-gameplay-trailer-final.mp4"
    preview = ROOT / "assets" / "branding" / "rouge-hate-trailer-preview.gif"
    print("[1/4] Generating original soundtrack...")
    build_soundtrack(soundtrack)
    print("[2/4] Recording real-time browser gameplay...")
    raw_video = record_gameplay()
    print("[3/4] Encoding H.264 promotional master...")
    mux_video(raw_video, soundtrack, destination)
    print("[4/4] Building README preview GIF...")
    build_preview(destination, preview)
    print(destination.resolve())


if __name__ == "__main__":
    main()
