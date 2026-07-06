#!/usr/bin/env python3
"""Auto-run EAS build with automated interactive credential setup."""

import os
import pty
import select
import subprocess
import sys
import time

os.chdir('/home/runner/workspace/artifacts/ridhi')
os.environ['EXPO_TOKEN'] = os.environ.get('EXPO_TOKEN', '')

# Common EAS CLI prompt responses
PROMPT_RESPONSES = {
    b'Which build profile': b'production\n',
    b'Which platform': b'ios\n',
    b'Do you want to log in': b'y\n',
    b'Press any key to continue': b'\n',
    b'Would you like to set up': b'y\n',
    b'Do you want to create': b'y\n',
    b'Would you like to use': b'1\n',
    b'Would you like to reuse': b'y\n',
    b'Enter the path': b'\n',
    b'Do you want to generate': b'y\n',
    b'Do you want to upload': b'n\n',
    b'Do you want to let Expo handle': b'y\n',
    b'Choose a build profile': b'\n',
    b'Distribution Certificate is not validated': b'',
    b'Which build profile do you want to configure': b'production\n',
    b'No saved credentials found': b'y\n',
    b'Would you like to create new credentials': b'y\n',
    b'Would you like to use the ASC API key': b'y\n',
    b'Would you like to use the App Store': b'y\n',
    b'Do you want to configure': b'y\n',
    b'Do you want to continue': b'y\n',
    b'Choose an action': b'1\n',
    b'Generate a new': b'y\n',
    b'Upload an existing': b'n\n',
    b'Would you like to review': b'n\n',
    b'Would you like to upload': b'n\n',
    b'Press Enter': b'\n',
    b'Press enter': b'\n',
    b'press any key': b'\n',
    b'Press any key': b'\n',
    b'Would you like to proceed': b'y\n',
    b'Would you like to run': b'y\n',
    b'Do you want to run': b'y\n',
    b'Which certificate': b'1\n',
    b'Which provisioning profile': b'1\n',
    b'Would you like to use existing': b'n\n',
    b'Would you like to create a new': b'y\n',
    b'Would you like to let EAS': b'y\n',
    b'Would you like EAS': b'y\n',
    b'Credentials are not set up': b'',
    b'Run this command again in interactive mode': b'',
}

def main():
    master_fd, slave_fd = pty.openpty()

    cmd = [
        'npx', 'eas', 'build',
        '--platform', 'ios',
        '--profile', 'production',
    ]

    env = os.environ.copy()

    proc = subprocess.Popen(
        cmd,
        stdin=slave_fd,
        stdout=slave_fd,
        stderr=slave_fd,
        env=env,
        cwd='/home/runner/workspace/artifacts/ridhi',
    )

    os.close(slave_fd)

    output_buffer = b''
    last_output = ''

    while proc.poll() is None:
        ready, _, _ = select.select([master_fd], [], [], 0.5)
        if ready:
            try:
                data = os.read(master_fd, 4096)
                if data:
                    output_buffer += data
                    text = data.decode('utf-8', errors='replace')
                    last_output += text
                    # Print to our stdout so we can see what's happening
                    sys.stdout.write(text)
                    sys.stdout.flush()

                    # Check for known prompts
                    for prompt_pattern, response in PROMPT_RESPONSES.items():
                        if prompt_pattern in output_buffer:
                            print(f"\n[auto-response] Detected prompt containing: {prompt_pattern.decode('utf-8', errors='replace')[:40]}...", file=sys.stderr)
                            os.write(master_fd, response)
                            output_buffer = b''  # Reset buffer
                            break
            except OSError:
                break

    # Read remaining output
    try:
        while True:
            ready, _, _ = select.select([master_fd], [], [], 0.5)
            if not ready:
                break
            data = os.read(master_fd, 4096)
            if not data:
                break
            sys.stdout.write(data.decode('utf-8', errors='replace'))
            sys.stdout.flush()
    except OSError:
        pass

    os.close(master_fd)
    return proc.returncode

if __name__ == '__main__':
    sys.exit(main())
