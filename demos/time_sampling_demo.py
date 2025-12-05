"""
Face Registration Demo - Time Sampling + Quality Filtering
Method 3: Automatic time-based sampling with quality assessment

Dependencies:
pip install mediapipe opencv-python numpy
"""

import cv2
import numpy as np
import mediapipe as mp
import time
from dataclasses import dataclass
from typing import List, Optional

# MediaPipe init
mp_face_mesh = mp.solutions.face_mesh
mp_face_detection = mp.solutions.face_detection

# Configuration
CAPTURE_INTERVAL = 1.5      # Seconds between captures
MIN_CAPTURES = 5            # Minimum photos to collect
MAX_CAPTURES = 15           # Maximum photos to collect
REGISTRATION_TIME = 15      # Total registration time (seconds)


@dataclass
class CapturedPhoto:
    """Captured photo with quality metrics"""
    image: np.ndarray
    timestamp: float
    quality_score: float
    face_size: float        # Face area ratio
    sharpness: float        # Laplacian variance
    brightness: float       # Average brightness
    face_centered: float    # Distance from center (0=perfect)
    landmarks: Optional[list] = None


class QualityAssessor:
    """Assess photo quality for face registration"""

    def __init__(self):
        self.face_detection = mp_face_detection.FaceDetection(
            model_selection=0,  # 0 for short range (< 2m)
            min_detection_confidence=0.5
        )
        self.face_mesh = mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def calculate_sharpness(self, gray_image: np.ndarray) -> float:
        """Calculate image sharpness using Laplacian variance"""
        laplacian = cv2.Laplacian(gray_image, cv2.CV_64F)
        return laplacian.var()

    def calculate_brightness(self, gray_image: np.ndarray) -> float:
        """Calculate average brightness (0-255)"""
        return np.mean(gray_image)

    def calculate_face_centered(self, face_bbox, img_w, img_h) -> float:
        """Calculate how centered the face is (0=perfect, 1=edge)"""
        face_center_x = face_bbox.xmin + face_bbox.width / 2
        face_center_y = face_bbox.ymin + face_bbox.height / 2

        # Distance from image center (normalized)
        dist_x = abs(face_center_x - 0.5) * 2
        dist_y = abs(face_center_y - 0.5) * 2

        return (dist_x + dist_y) / 2

    def assess(self, frame: np.ndarray) -> Optional[CapturedPhoto]:
        """
        Assess a frame and return CapturedPhoto if face detected

        Returns None if no face or poor quality
        """
        h, w = frame.shape[:2]
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Detect face
        detection_results = self.face_detection.process(rgb_frame)
        if not detection_results.detections:
            return None

        detection = detection_results.detections[0]
        bbox = detection.location_data.relative_bounding_box

        # Check if face is too small or too large
        face_area = bbox.width * bbox.height
        if face_area < 0.05 or face_area > 0.8:
            return None

        # Get face mesh landmarks
        mesh_results = self.face_mesh.process(rgb_frame)
        landmarks = None
        if mesh_results.multi_face_landmarks:
            landmarks = mesh_results.multi_face_landmarks[0].landmark

        # Calculate metrics
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Extract face region for quality assessment
        x1 = max(0, int(bbox.xmin * w))
        y1 = max(0, int(bbox.ymin * h))
        x2 = min(w, int((bbox.xmin + bbox.width) * w))
        y2 = min(h, int((bbox.ymin + bbox.height) * h))
        face_region = gray[y1:y2, x1:x2]

        if face_region.size == 0:
            return None

        sharpness = self.calculate_sharpness(face_region)
        brightness = self.calculate_brightness(face_region)
        face_centered = self.calculate_face_centered(bbox, w, h)

        # Calculate overall quality score (weighted sum)
        # Higher is better
        quality_score = (
            min(sharpness / 500, 1.0) * 0.3 +           # Sharpness (capped)
            (1 - abs(brightness - 127) / 127) * 0.2 +   # Brightness (optimal ~127)
            (1 - face_centered) * 0.2 +                  # Centered
            min(face_area * 5, 1.0) * 0.3               # Face size
        )

        return CapturedPhoto(
            image=frame.copy(),
            timestamp=time.time(),
            quality_score=quality_score,
            face_size=face_area,
            sharpness=sharpness,
            brightness=brightness,
            face_centered=face_centered,
            landmarks=landmarks
        )


class FaceRegistrationDemo:
    """Face Registration using Time Sampling + Quality Filtering"""

    def __init__(self):
        self.assessor = QualityAssessor()
        self.captured_photos: List[CapturedPhoto] = []
        self.start_time: Optional[float] = None
        self.last_capture_time: float = 0
        self.is_registering = False

    def select_best_photos(self, n: int = 5) -> List[CapturedPhoto]:
        """Select the best N photos based on quality and diversity"""
        if len(self.captured_photos) <= n:
            return self.captured_photos

        # Sort by quality
        sorted_photos = sorted(
            self.captured_photos,
            key=lambda p: p.quality_score,
            reverse=True
        )

        # Select top N with some time diversity
        selected = []
        min_time_gap = REGISTRATION_TIME / (n * 2)

        for photo in sorted_photos:
            if len(selected) >= n:
                break

            # Check time diversity
            is_diverse = True
            for existing in selected:
                if abs(photo.timestamp - existing.timestamp) < min_time_gap:
                    is_diverse = False
                    break

            if is_diverse or len(selected) < 3:  # Always pick at least 3 best
                selected.append(photo)

        return selected

    def draw_ui(self, frame, face_detected: bool, current_photo: Optional[CapturedPhoto]):
        """Draw UI elements on frame"""
        h, w = frame.shape[:2]

        # Draw oval guide
        center = (w // 2, h // 2)
        oval_size = (180, 240)

        if self.is_registering:
            if face_detected:
                oval_color = (0, 255, 0)  # Green
            else:
                oval_color = (0, 0, 255)  # Red
        else:
            oval_color = (100, 100, 100)  # Gray

        cv2.ellipse(frame, center, oval_size, 0, 0, 360, oval_color, 3)

        # Draw progress ring
        if self.is_registering and self.start_time:
            elapsed = time.time() - self.start_time
            progress = min(elapsed / REGISTRATION_TIME, 1.0)

            ring_radius = max(oval_size) + 20
            end_angle = -90 + int(360 * progress)
            cv2.ellipse(frame, center, (ring_radius, ring_radius), 0,
                       -90, end_angle, (0, 255, 0), 4)

        # Title
        cv2.putText(frame, "KindyGuard Face Registration", (20, 40),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

        # Status text
        if self.is_registering:
            elapsed = time.time() - self.start_time if self.start_time else 0
            remaining = max(0, REGISTRATION_TIME - elapsed)
            text = f"Recording... {remaining:.1f}s remaining"
            color = (0, 255, 0)
        else:
            text = "Press SPACE to start registration"
            color = (200, 200, 200)

        text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
        text_x = (w - text_size[0]) // 2
        cv2.putText(frame, text, (text_x, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

        # Capture count
        cv2.putText(frame, f"Photos: {len(self.captured_photos)}/{MAX_CAPTURES}",
                   (w - 200, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)

        # Quality meter (if photo captured)
        if current_photo:
            # Draw quality bar
            bar_x, bar_y = 20, h - 100
            bar_width, bar_height = 200, 20

            cv2.rectangle(frame, (bar_x, bar_y),
                         (bar_x + bar_width, bar_y + bar_height),
                         (100, 100, 100), -1)

            quality_width = int(bar_width * current_photo.quality_score)
            quality_color = (0, 255, 0) if current_photo.quality_score > 0.6 else (0, 255, 255)
            cv2.rectangle(frame, (bar_x, bar_y),
                         (bar_x + quality_width, bar_y + bar_height),
                         quality_color, -1)

            cv2.putText(frame, f"Quality: {current_photo.quality_score:.0%}",
                       (bar_x, bar_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

            # Metrics
            metrics = [
                f"Sharpness: {current_photo.sharpness:.0f}",
                f"Brightness: {current_photo.brightness:.0f}",
                f"Face Size: {current_photo.face_size:.0%}",
            ]
            for i, m in enumerate(metrics):
                cv2.putText(frame, m, (20, h - 50 + i * 20),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)

        # Instructions
        instructions = [
            "Instructions:",
            "1. Press SPACE to start",
            "2. Move your head slowly",
            "3. Look in different directions",
            "4. Best photos will be selected"
        ]
        for i, text in enumerate(instructions):
            cv2.putText(frame, text, (w - 250, 80 + i * 25),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)

        return frame

    def draw_capture_flash(self, frame):
        """Draw a brief flash effect when capturing"""
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (frame.shape[1], frame.shape[0]),
                     (255, 255, 255), -1)
        return cv2.addWeighted(overlay, 0.3, frame, 0.7, 0)

    def run(self):
        """Run the demo"""
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

        print("=" * 50)
        print("Face Registration - Time Sampling + Quality Filter")
        print("=" * 50)
        print("Press SPACE to start registration")
        print("Press 'q' to quit, 'r' to reset")
        print("=" * 50)

        flash_until = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.flip(frame, 1)
            current_time = time.time()

            # Assess current frame
            photo = self.assessor.assess(frame)
            face_detected = photo is not None

            # Auto capture during registration
            if self.is_registering:
                elapsed = current_time - self.start_time

                # Check if registration time is over
                if elapsed >= REGISTRATION_TIME:
                    self.is_registering = False
                    print(f"\n[DONE] Registration complete!")
                    print(f"Captured {len(self.captured_photos)} photos")

                    # Select best photos
                    best_photos = self.select_best_photos(MIN_CAPTURES)
                    print(f"Selected {len(best_photos)} best photos:")
                    for i, p in enumerate(best_photos):
                        print(f"  {i+1}. Quality: {p.quality_score:.0%}, "
                              f"Sharpness: {p.sharpness:.0f}")

                # Capture at intervals
                elif (face_detected and
                      current_time - self.last_capture_time >= CAPTURE_INTERVAL and
                      len(self.captured_photos) < MAX_CAPTURES):

                    self.captured_photos.append(photo)
                    self.last_capture_time = current_time
                    flash_until = current_time + 0.1
                    print(f"[CAPTURE] Photo {len(self.captured_photos)}: "
                          f"Quality={photo.quality_score:.0%}")

            # Draw UI
            if current_time < flash_until:
                frame = self.draw_capture_flash(frame)

            frame = self.draw_ui(frame, face_detected, photo)

            cv2.imshow('Face Registration Demo', frame)

            # Key handling
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord(' ') and not self.is_registering:
                # Start registration
                self.is_registering = True
                self.start_time = current_time
                self.last_capture_time = 0
                self.captured_photos.clear()
                print("\n[START] Registration started!")
                print("Please move your head slowly in different directions...")
            elif key == ord('r'):
                self.is_registering = False
                self.captured_photos.clear()
                self.start_time = None
                print("\n[RESET] Registration reset")

        cap.release()
        cv2.destroyAllWindows()

        # Final summary and save photos
        if self.captured_photos:
            print("\n" + "=" * 50)
            print("Final Summary")
            print("=" * 50)
            best = self.select_best_photos(MIN_CAPTURES)
            print(f"Total captured: {len(self.captured_photos)}")
            print(f"Best selected: {len(best)}")
            avg_quality = sum(p.quality_score for p in best) / len(best)
            print(f"Average quality: {avg_quality:.0%}")

            # Save photos
            import os
            output_dir = "captured_faces"
            os.makedirs(output_dir, exist_ok=True)

            print(f"\nSaving photos to '{output_dir}/' ...")

            # Save all captured photos
            all_dir = os.path.join(output_dir, "all")
            os.makedirs(all_dir, exist_ok=True)
            for i, photo in enumerate(self.captured_photos):
                filename = f"photo_{i+1:02d}_q{photo.quality_score:.0%}.jpg"
                filepath = os.path.join(all_dir, filename)
                cv2.imwrite(filepath, photo.image)

            print(f"  - Saved {len(self.captured_photos)} photos to '{all_dir}/'")

            # Save best selected photos
            best_dir = os.path.join(output_dir, "best")
            os.makedirs(best_dir, exist_ok=True)
            for i, photo in enumerate(best):
                filename = f"best_{i+1:02d}_q{photo.quality_score:.0%}.jpg"
                filepath = os.path.join(best_dir, filename)
                cv2.imwrite(filepath, photo.image)

            print(f"  - Saved {len(best)} best photos to '{best_dir}/'")

            # Create a comparison grid image
            self.create_comparison_grid(best, output_dir)

    def create_comparison_grid(self, photos: List[CapturedPhoto], output_dir: str):
        """Create a grid image showing all selected photos"""
        import os
        if not photos:
            return

        # Resize all photos to same size
        thumb_size = (200, 200)
        thumbnails = []

        for photo in photos:
            # Crop face region (center crop)
            h, w = photo.image.shape[:2]
            size = min(h, w)
            y1 = (h - size) // 2
            x1 = (w - size) // 2
            cropped = photo.image[y1:y1+size, x1:x1+size]
            resized = cv2.resize(cropped, thumb_size)

            # Add quality label
            cv2.putText(resized, f"Q:{photo.quality_score:.0%}",
                       (5, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
            cv2.putText(resized, f"S:{photo.sharpness:.0f}",
                       (5, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

            thumbnails.append(resized)

        # Create grid (max 5 columns)
        cols = min(5, len(thumbnails))
        rows = (len(thumbnails) + cols - 1) // cols

        grid_h = rows * thumb_size[1]
        grid_w = cols * thumb_size[0]
        grid = np.zeros((grid_h, grid_w, 3), dtype=np.uint8)

        for i, thumb in enumerate(thumbnails):
            row = i // cols
            col = i % cols
            y = row * thumb_size[1]
            x = col * thumb_size[0]
            grid[y:y+thumb_size[1], x:x+thumb_size[0]] = thumb

        # Save grid
        grid_path = os.path.join(output_dir, "comparison_grid.jpg")
        cv2.imwrite(grid_path, grid)
        print(f"  - Saved comparison grid to '{grid_path}'")


if __name__ == "__main__":
    demo = FaceRegistrationDemo()
    demo.run()
