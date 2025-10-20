/**
 * AudioRecorder class for browser-based audio recording
 * Uses MediaRecorder API to capture audio in WebM format
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;

  /**
   * Start recording audio from the provided MediaStream
   * @param stream - MediaStream containing audio tracks (from Daily.co)
   */
  async startRecording(stream: MediaStream): Promise<void> {
    try {
      this.stream = stream;
      this.audioChunks = [];
      this.startTime = Date.now();

      // Create MediaRecorder with WebM format
      const options = { mimeType: "audio/webm" };
      this.mediaRecorder = new MediaRecorder(stream, options);

      // Collect audio data chunks
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording (collect data every second)
      this.mediaRecorder.start(1000);
      console.log("🎙️ Audio recording started");
    } catch (error) {
      console.error("Failed to start audio recording:", error);
      throw error;
    }
  }

  /**
   * Stop recording and return the audio blob
   * @returns Promise<Blob> - WebM audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("MediaRecorder not initialized"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        const duration = (Date.now() - this.startTime) / 1000;
        console.log(
          `🎙️ Audio recording stopped. Duration: ${duration}s, Size: ${audioBlob.size} bytes`
        );
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (error) => {
        console.error("MediaRecorder error:", error);
        reject(error);
      };

      this.mediaRecorder.stop();

      // Stop all audio tracks
      if (this.stream) {
        this.stream.getAudioTracks().forEach((track) => track.stop());
      }
    });
  }

  /**
   * Get recording duration in seconds
   */
  getDuration(): number {
    if (this.startTime === 0) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}
