import os
import sys
import tarfile
import urllib.request
import shutil

TOOLS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tools")
os.makedirs(TOOLS_DIR, exist_ok=True)

JDK_URL = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10%2B7/OpenJDK17U-jdk_aarch64_mac_hotspot_17.0.10_7.tar.gz"
MAVEN_URL = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz"

def download_with_progress(url, dest_path):
    print(f"[DOWNLOAD] Starting download: {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as response, open(dest_path, "wb") as out_file:
        total_length = response.getheader('content-length')
        if total_length is not None:
            total_length = int(total_length)
            dl = 0
            while True:
                buffer = response.read(1024 * 1024)
                if not buffer:
                    break
                dl += len(buffer)
                out_file.write(buffer)
                percent = int(dl * 100 / total_length)
                print(f"[DOWNLOAD] {percent}% ({dl // (1024*1024)}MB / {total_length // (1024*1024)}MB)", end="\r")
        else:
            out_file.write(response.read())
    print(f"\n[DOWNLOAD] Completed: {dest_path}")

def setup_jdk():
    jdk_dir = os.path.join(TOOLS_DIR, "jdk-17")
    java_bin = os.path.join(jdk_dir, "Contents", "Home", "bin", "java")
    if os.path.exists(java_bin):
        print(f"[OK] JDK 17 already setup at {jdk_dir}")
        return jdk_dir

    tar_file = os.path.join(TOOLS_DIR, "jdk17.tar.gz")
    if not os.path.exists(tar_file):
        download_with_progress(JDK_URL, tar_file)

    print("[EXTRACT] Extracting JDK 17...")
    extract_temp = os.path.join(TOOLS_DIR, "jdk_temp")
    os.makedirs(extract_temp, exist_ok=True)
    with tarfile.open(tar_file, "r:gz") as t:
        t.extractall(extract_temp)

    inner_dirs = [d for d in os.listdir(extract_temp) if os.path.isdir(os.path.join(extract_temp, d))]
    if inner_dirs:
        shutil.move(os.path.join(extract_temp, inner_dirs[0]), jdk_dir)
    shutil.rmtree(extract_temp, ignore_errors=True)
    if os.path.exists(tar_file):
        os.remove(tar_file)
    print(f"[OK] JDK 17 installed at {jdk_dir}")
    return jdk_dir

def setup_maven():
    mvn_dir = os.path.join(TOOLS_DIR, "maven")
    mvn_bin = os.path.join(mvn_dir, "bin", "mvn")
    if os.path.exists(mvn_bin):
        print(f"[OK] Maven already setup at {mvn_dir}")
        return mvn_dir

    tar_file = os.path.join(TOOLS_DIR, "maven.tar.gz")
    if not os.path.exists(tar_file):
        download_with_progress(MAVEN_URL, tar_file)

    print("[EXTRACT] Extracting Maven...")
    extract_temp = os.path.join(TOOLS_DIR, "mvn_temp")
    os.makedirs(extract_temp, exist_ok=True)
    with tarfile.open(tar_file, "r:gz") as t:
        t.extractall(extract_temp)

    inner_dirs = [d for d in os.listdir(extract_temp) if os.path.isdir(os.path.join(extract_temp, d))]
    if inner_dirs:
        shutil.move(os.path.join(extract_temp, inner_dirs[0]), mvn_dir)
    shutil.rmtree(extract_temp, ignore_errors=True)
    if os.path.exists(tar_file):
        os.remove(tar_file)
    print(f"[OK] Maven installed at {mvn_dir}")
    return mvn_dir

if __name__ == "__main__":
    setup_jdk()
    setup_maven()
