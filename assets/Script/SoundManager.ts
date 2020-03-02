const PATH_MUSIC = 'audio/music';
const PATH_SFX = 'audio/sfx';

export default new class SoundManager {
    private audioClips = {};

    private playingClips = {};


    loadAllAudio(musicProgressHandler, sfxProgressHandler): Promise<any> {
        return Promise.all([
            this.loadAudio(PATH_MUSIC, musicProgressHandler),
            this.loadAudio(PATH_SFX, sfxProgressHandler),
        ]);
    }

    play(id: string, loop: boolean, volume: number = 0.5, storeAudioId = false) {
        const clip = this.audioClips[id];
        if (clip === undefined) {
            throw new Error('Undefined sound');
        }

        const audioId = cc.audioEngine.play(clip, loop, volume);
        if (loop || storeAudioId) {
            this.playingClips[id] = audioId;
        }
    }

    stop(id: string) {
        const audioId = this.playingClips[cliidpId];
        if (audioId !== undefined) {
            cc.audioEngine.stop(audioId);
            delete this.playingClips[id];
        }
    }

    private loadAudio(path: string, progressHandler?): Promise<any> {
        return new Promise((resolve, reject) => {
            cc.loader.loadResDir(path, cc.AudioClip, progressHandler, (err, audioClips: cc.AudioClip[]) => {
                if (err) {
                    return reject(err);
                }

                audioClips.forEach((audioClip: cc.AudioClip) => {
                    this.audioClips[audioClip.name] = audioClip;
                });
                return resolve();
            });
        });
    }
}