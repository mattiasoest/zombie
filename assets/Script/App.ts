import SoundManager from './SoundManager';
import Level from './core/Level';


class App {

    level: Level;

    loadedRes = false;

    initApp() {
        this.level = new Level();
        // SoundManager.loadAllAudio(this.progressHandler, this.progressHandler);
        SoundManager.loadAllAudio();
    }

    progressHandler(currentCount: number, totalCount: number) {
        console.log(`Progress ${currentCount / totalCount}`);
    }


    loadDir(path: string, progressHandler?): Promise<any> {
        return new Promise((resolve, reject) => {
            cc.loader.loadResDir(path, progressHandler, (err, assets) => {
                if (err) {
                    return reject(err);
                }
                console.log(`Loaded ${path}`);
                return resolve();
            });
        });
    }
}

const instance = new App();
export default instance;

