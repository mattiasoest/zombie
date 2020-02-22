const PATH_MUSIC = 'audio/music';
const PATH_SFX = 'audio/sfx';

export default new class SoundManager {
    private audioClips = {};


    loadAllAudio(musicProgressHandler, sfxProgressHandler): Promise<any> {
        return Promise.all([
            this.loadAudio(PATH_MUSIC, musicProgressHandler),
            this.loadAudio(PATH_SFX, sfxProgressHandler),
        ]);
    }

    play(id: string, loop: boolean, volume: number = 0.5) {
        const clip = this.audioClips[id];
        if (clip === undefined) {
            throw new Error('Undefined sound');
        }

        cc.audioEngine.play(clip, loop, volume);
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