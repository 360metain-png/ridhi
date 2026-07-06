#!/usr/bin/env python3
"""Background daemon that runs EAS build with auto-responses including 2FA."""

import os
import pty
import select
import subprocess
import sys
import time

os.chdir('/home/runner/workspace/artifacts/ridhi')

AUTO_YES = b'y\n'
AUTO_NO = b'n\n'
AUTO_ENTER = b'\n'
AUTO_1 = b'1\n'

PROMPTS = [
    (b'Would you like to install', AUTO_YES),
    (b'Do you want to log in', AUTO_YES),
    (b'Would you like to set up', AUTO_YES),
    (b'Do you want to create', AUTO_YES),
    (b'Would you like to use', AUTO_1),
    (b'Would you like to reuse', AUTO_YES),
    (b'Do you want to generate', AUTO_YES),
    (b'Do you want to upload', AUTO_YES),
    (b'Do you want to let Expo handle', AUTO_YES),
    (b'Would you like to create new credentials', AUTO_YES),
    (b'Would you like to use the ASC API key', AUTO_YES),
    (b'Would you like to use the App Store', AUTO_YES),
    (b'Do you want to configure', AUTO_YES),
    (b'Do you want to continue', AUTO_YES),
    (b'Choose an action', AUTO_1),
    (b'Generate a new', AUTO_YES),
    (b'Upload an existing', AUTO_YES),
    (b'Would you like to review', AUTO_NO),
    (b'Would you like to proceed', AUTO_YES),
    (b'Would you like to run', AUTO_YES),
    (b'Do you want to run', AUTO_YES),
    (b'Which certificate', AUTO_1),
    (b'Which provisioning profile', AUTO_1),
    (b'Would you like to use existing', AUTO_YES),
    (b'Would you like to create a new', AUTO_YES),
    (b'Would you like to let EAS', AUTO_YES),
    (b'Would you like EAS', AUTO_YES),
    (b'Which build profile', AUTO_ENTER),
    (b'Press any key', AUTO_ENTER),
    (b'Press Enter', AUTO_ENTER),
    (b'press any key', AUTO_ENTER),
    (b'press enter', AUTO_ENTER),
    (b'Choose a build profile', AUTO_ENTER),
    (b'No saved credentials found', AUTO_YES),
    (b'Credentials are not set up', b''),
    (b'Would you like to try again', AUTO_NO),
    (b'How do you want to validate', b'1\n'),  # device option
    (b'6 digit code', b'075087\n'),  # 2FA code
    (b'six digit code', b'075087\n'),
    (b'verification code', b'075087\n'),
    (b'authentication code', b'075087\n'),
    (b'Please enter the 6 digit code', b'075087\n'),
    (b'Enter the 6 digit code', b'075087\n'),
]

def main():
    master_fd, slave_fd = pty.openpty()

    env = os.environ.copy()
    env['FORCE_COLOR'] = '1'
    env['EXPO_APPLE_ID'] = '360meta.in@gmail.com'
    env['EXPO_APPLE_PASSWORD'] = 'Kliker@21'
    env['EXPO_APPLE_TEAM_ID'] = '5U48FR7799'
    env['EXPO_TOKEN'] = os.environ.get('EXPO_TOKEN', '')

    proc = subprocess.Popen(
        ['npx', 'eas', 'build', '--platform', 'ios', '--profile', 'production'],
        stdin=slave_fd,
        stdout=slave_fd,
        stderr=slave_fd,
        env=env,
        cwd='/home/runner/workspace/artifacts/ridhi',
    )
    os.close(slave_fd)

    log_path = '/tmp/eas_daemon.log'
    buf = b''
    responded = set()

    with open(log_path, 'wb') as logf:
        while proc.poll() is None:
            ready, _, _ = select.select([master_fd], [], [], 0.3)
            if ready:
                try:
                    chunk = os.read(master_fd, 8192)
                    if chunk:
                        logf.write(chunk)
                        logf.flush()
                        buf += chunk
                        if len(buf) > 50000:
                            buf = buf[-20000:]

                        for prompt, response in PROMPTS:
                            if prompt in buf:
                                pid = id(prompt)
                                if pid not in responded:
                                    logf.write(f"\n[Auto] Responding to: {prompt.decode('utf-8', errors='replace')[:60]}...\n".encode())
                                    logf.flush()
                                    os.write(master_fd, response)
                                    responded.add(pid)
                                    buf = b''
                                    break
                except (OSError, IOError):
                    break

        # Drain remaining
        while True:
            ready, _, _ = select.select([master_fd], [], [], 1.0)
            if not ready:
                break
            try:
                chunk = os.read(master_fd, 8192)
                if chunk:
                    logf.write(chunk)
                    logf.flush()
                else:
                    break
            except (OSError, IOError):
                break

    os.close(master_fd)
    with open('/tmp/eas_daemon_exit.txt', 'w') as f:
        f.write(str(proc.returncode))
    return proc.returncode

if __name__ == '__main__':
    sys.exit(main())
