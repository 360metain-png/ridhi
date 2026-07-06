#!/usr/bin/env python3
"""Automated EAS iOS build using pexpect + ASC API Key mode."""
import os, pexpect, sys, time

os.chdir('/home/runner/workspace/artifacts/ridhi')
log = open('/tmp/eas_build_auto.log', 'wb')

# Must NOT set EXPO_APPLE_ID / EXPO_APPLE_PASSWORD — forces API_KEY mode
for k in ['EXPO_APPLE_ID', 'EXPO_APPLE_PASSWORD']:
    if k in os.environ:
        del os.environ[k]

child = pexpect.spawn(
    'npx eas build --platform ios --profile production',
    cwd='/home/runner/workspace/artifacts/ridhi',
    env=os.environ,
    timeout=600,
    maxread=8192,
)
child.logfile_read = log

# Patterns only (no tuples) — pexpect expects strings/bytes
patterns = [
    r'Select your Apple Team Type',                # 0
    r'Do you want to log in to your Apple account',  # 1
    r'Would you like to set up',                   # 2
    r'Do you want to create',                      # 3
    r'Would you like to use',                      # 4
    r'Would you like to reuse',                     # 5
    r'Do you want to generate',                    # 6
    r'Do you want to upload',                      # 7
    r'Do you want to let Expo handle',             # 8
    r'Would you like to create new credentials',    # 9
    r'Would you like to use the ASC API key',       # 10
    r'Would you like to use the App Store',         # 11
    r'Do you want to configure',                    # 12
    r'Do you want to continue',                     # 13
    r'Would you like to review',                    # 14
    r'Would you like to proceed',                   # 15
    r'Would you like to run',                       # 16
    r'Do you want to run',                          # 17
    r'Would you like to try again',                 # 18
    r'Would you like to let EAS',                   # 19
    r'Would you like EAS',                          # 20
    r'Choose an action',                            # 21
    r'Generate a new',                              # 22
    r'Upload an existing',                          # 23
    r'Would you like to use existing',              # 24
    r'Would you like to create a new',              # 25
    r'Which certificate',                           # 26
    r'Which provisioning profile',                  # 27
    r'Which build profile',                         # 28
    r'Press any key',                               # 29
    r'Press Enter',                                 # 30
    r'press any key',                               # 31
    r'press enter',                                 # 32
    r'No saved credentials found',                  # 33
    r'Credentials are not set up',                  # 34
    r'6 digit code',                                # 35
    r'verification code',                          # 36
    r'Enter the 6 digit code',                    # 37
    r'Build details:',                              # 38
    r'Waiting for build',                           # 39
    r'Build queued',                                # 40
    r'Build started',                               # 41
    r'Error: build command failed',                 # 42
    pexpect.EOF,                                   # 43
    pexpect.TIMEOUT,                               # 44
]

responses = {
    0:  '\x1b[B\r',   # TEAM_TYPE: Down arrow + Enter (Company/Organization)
    1:  'n\r',        # APPLE_LOGIN: No
    2:  'y\r',        # SETUP
    3:  'y\r',        # CREATE
    4:  '1\r',        # USE: option 1
    5:  'y\r',        # REUSE
    6:  'y\r',        # GENERATE
    7:  'y\r',        # UPLOAD
    8:  'y\r',        # LET_EXPO
    9:  'y\r',        # CREATE_CREDS
    10: 'y\r',        # USE_ASC
    11: 'y\r',        # USE_APP_STORE
    12: 'y\r',        # CONFIGURE
    13: 'y\r',        # CONTINUE
    14: 'n\r',        # REVIEW: No
    15: 'y\r',        # PROCEED
    16: 'y\r',        # RUN
    17: 'y\r',        # RUN2
    18: 'n\r',        # TRY_AGAIN: No
    19: 'y\r',        # LET_EAS
    20: 'y\r',        # EAS
    21: '1\r',        # CHOOSE_ACTION
    22: 'y\r',        # GENERATE_NEW
    23: 'y\r',        # UPLOAD_EXISTING
    24: 'y\r',        # USE_EXISTING
    25: 'y\r',        # CREATE_NEW
    26: '1\r',        # CERTIFICATE
    27: '1\r',        # PROVISIONING
    28: '\r',         # BUILD_PROFILE: default
    29: '\r',         # PRESS_KEY
    30: '\r',         # PRESS_ENTER
    31: '\r',         # PRESS_KEY2
    32: '\r',         # PRESS_ENTER2
    33: 'y\r',        # NO_SAVED_CREDS
    34: '\r',         # CREDS_NOT_SETUP
    35: '075087\r',   # SIX_DIGIT (fallback if needed)
    36: '075087\r',   # VERIFY_CODE
    37: '075087\r',   # ENTER_CODE
    38: None,         # BUILD_DETAILS: just log
    39: None,         # WAITING
    40: None,         # QUEUED
    41: None,         # STARTED
    42: None,         # BUILD_ERROR
}

try:
    while child.isalive():
        idx = child.expect(patterns, timeout=180)
        if idx == 43:  # EOF
            print('[EOF] Process ended', file=sys.stderr)
            break
        if idx == 44:  # TIMEOUT
            continue
        name = patterns[idx]
        print(f'[Prompt matched: idx={idx}]', file=sys.stderr)
        if idx in responses:
            resp = responses[idx]
            if resp is not None:
                print(f'[Response] Sending: {repr(resp)}', file=sys.stderr)
                child.send(resp)
            else:
                print(f'[Response] No action needed for build progress/error', file=sys.stderr)
        else:
            print(f'[Response] Default yes', file=sys.stderr)
            child.send('y\r')
except Exception as e:
    print(f'[Exception] {e}', file=sys.stderr)
finally:
    remaining = child.read()
    if remaining:
        log.write(remaining)
    log.write(f'\n\nEXIT_CODE={child.exitstatus}\n'.encode())
    log.close()
    print(f'[Done] Exit: {child.exitstatus}', file=sys.stderr)

sys.exit(child.exitstatus or 0)
