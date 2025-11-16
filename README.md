# 🖼️ RN Little Kiosk - Animated Portrait Display

A React Native kiosk application that brings portraits to life with motion-activated video playback, inspired by magical animated portraits. Perfect for museums, exhibitions, art installations, or home decoration.

## 🎯 What is it?

RN Little Kiosk transforms a tablet into an interactive animated portrait display. When someone passes by, the camera detects motion and triggers video playback, creating an engaging and magical experience. When no one is around, the display returns to a peaceful static state.

Think of it as bringing static portraits to life - like animated paintings in a fantasy world, but using real camera-based motion detection.

## ✨ Key Features

### 📹 Motion-Activated Video Playback
- **Camera-based motion detection**: Uses the device's front or back camera to detect movement
- **Intelligent sensitivity**: Adjustable motion sensitivity (0-100) to tune detection range
- **Smart playback**: Videos play completely when motion is detected, then pause until next movement
- **No false triggers**: Configurable inactivity delay to avoid premature stops

### 🎬 Dynamic Video Management
- **Multiple video support**: Rotate through a library of videos automatically
- **Two rotation modes**:
  - **Random**: Picks a different video each time, avoiding immediate repetition
  - **Sequential**: Plays videos in order (1, 2, 3...)
- **Flexible storage**: Load videos from device Download folder, internal storage, or custom paths
- **Easy import**: Built-in tools to import videos from accessible folders

### 🔧 Kiosk Mode
- **Full-screen immersive mode**: Hides system UI for distraction-free display
- **Portrait orientation locked**: Optimized for vertical displays
- **Screen always-on**: Prevents sleep during operation
- **Triple-tap settings access**: Hidden settings accessible via gesture (prevent accidental changes)
- **PIN protection** (optional): Secure settings behind a PIN code

### ⚙️ Comprehensive Settings
- **Video Configuration**:
  - Custom folder path with quick shortcuts
  - Auto-rotation enable/disable
  - Rotation mode selection
  - Diagnostic tools to verify video access
  
- **Motion Detection**:
  - Adjustable sensitivity with +/- buttons
  - Configurable inactivity delay
  - Detection zone selection (fullscreen/center/sides)
  
- **Display Options**:
  - Brightness control
  - Fullscreen mode toggle
  - Debug overlay for troubleshooting
  
- **Scheduling** (future):
  - Auto sleep/wake times
  - Active days configuration
  - Energy saving mode

## 🎨 Use Cases

- **Art Museums & Galleries**: Bring portraits to life when visitors approach
- **Exhibition Spaces**: Create interactive displays for events
- **Home Decoration**: Turn a tablet into a magical portrait display
- **Retail Displays**: Engage customers with motion-activated content
- **Educational Installations**: Interactive history or art exhibits
- **Entertainment Venues**: Themed decorations with animated characters

## 🛠️ Technical Highlights

### Architecture
- **React Native 0.82.1** with TypeScript
- **Native Android modules** for camera and file system access
- **AsyncStorage** for persistent settings
- **react-native-video** with ExoPlayer for smooth playback
- **Camera2 API** for low-level motion detection

### Motion Detection Algorithm
- Captures frames from camera at regular intervals
- Analyzes pixel brightness changes in YUV format
- Compares frame differences against configurable threshold
- Filters noise and false positives
- Ultra-low latency (<100ms response time)

### Video Rotation System
- Intelligent video selection based on rotation mode
- Memory of recently played videos (random mode)
- Automatic reset when all videos are seen
- Dynamic path construction from settings
- Support for unlimited video count

### Permissions & Storage
- **READ_MEDIA_VIDEO**: Access videos on Android 13+
- **READ_EXTERNAL_STORAGE**: Compatibility with older Android versions
- **CAMERA**: Motion detection via device camera
- **MANAGE_EXTERNAL_STORAGE**: Full storage access for flexibility
- Built-in diagnostic tools to verify permissions and file access

## 📱 Device Requirements

- **Android tablet** (tested on Samsung Galaxy Tab 8)
- **Android 10+** (Android 13+ recommended for best permission handling)
- **Camera** (front or back)
- **Portrait orientation** display
- **Sufficient storage** for video files

## 🎥 Supported Video Formats

- MP4 (recommended)
- MOV
- AVI
- MKV
- WebM

Videos should be in portrait orientation (9:16 or similar) for best results.

## 🔐 Security Features

- Triple-tap gesture prevents accidental settings access
- Optional PIN protection for kiosk mode
- Settings hidden in production mode
- Locked orientation and system UI

## 📊 Performance

- **Startup time**: < 2 seconds
- **Motion detection latency**: < 100ms
- **Video switching**: Instantaneous
- **Memory usage**: Optimized for 24/7 operation
- **Battery**: Screen-on optimized (use with power adapter recommended)

## 🚀 Future Enhancements

- [ ] Scheduled activation/deactivation
- [ ] Cloud video sync
- [ ] Multiple video packs
- [ ] Transition effects between videos
- [ ] Audio support with ambient sound
- [ ] Analytics and usage statistics
- [ ] Remote configuration
- [ ] Multi-device synchronization

---

**Built with ❤️ using React Native**
