// services/AudioManager.ts
import Sound from 'react-native-sound';

class CommonAudioManagerClass {
    // 기본 배경음악용
    backgroundMusic: Sound | null = null;
    // 게임 배경음악용
    gameBackgroundMusic: Sound | null = null;

    playBackgroundMusic() {
        this.backgroundMusic = new Sound('basic_background_music.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('Error loading basic background music:', error);
                return;
            }
            this.backgroundMusic?.setNumberOfLoops(-1);
            this.backgroundMusic?.play((success) => {
                if (!success) {
                    console.log('Basic background music playback failed');
                }
            });
        });
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop(() => {
                this.backgroundMusic?.release();
                this.backgroundMusic = null;
            });
        }
    }

    // 게임 배경음악 재생 메서드
    playGameBackgroundMusic() {
        this.gameBackgroundMusic = new Sound('find_it_background_music.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('Error loading game background music:', error);
                return;
            }
            this.gameBackgroundMusic?.setNumberOfLoops(-1);
            this.gameBackgroundMusic?.play((success) => {
                if (!success) {
                    console.log('Game background music playback failed');
                }
            });
        });
    }

    stopGameBackgroundMusic() {
        if (this.gameBackgroundMusic) {
            this.gameBackgroundMusic.stop(() => {
                this.gameBackgroundMusic?.release();
                this.gameBackgroundMusic = null;
            });
        }
    }
    initBackgroundMusic() {
        if (this.gameBackgroundMusic) {
            this.gameBackgroundMusic.stop(() => {
                this.gameBackgroundMusic?.release();
                this.gameBackgroundMusic = null;
            });
        }
        if (this.backgroundMusic) {
            this.backgroundMusic.stop(() => {
                this.backgroundMusic?.release();
                this.backgroundMusic = null;
            });
        }
    }
}

export const CommonAudioManager = new CommonAudioManagerClass();