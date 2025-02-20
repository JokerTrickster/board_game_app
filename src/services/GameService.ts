import AsyncStorage from '@react-native-async-storage/async-storage';

class GameService {
    private roomID: number | null = null;
    private users: any[] = [];
    private imageID: number | null = null;
    private gameInfo: any = {};
    private round: number | null = null;
    private normalImageUrl: string | null = null;
    private abnormalImageUrl: string | null = null;

    async setRoomID(id: number) {
        this.roomID = id;
        await AsyncStorage.setItem('roomID', String(id));
    }

    async setImageID(id: number) {
        this.imageID = id;
        await AsyncStorage.setItem('imageID', String(id));
    }

    async setRound(id: number) {
        this.round = id;
        await AsyncStorage.setItem('round', String(id));
    }
    async setNormalImage(imageUrl: string) {
        this.normalImageUrl = imageUrl
        await AsyncStorage.setItem('normalImageUrl',String(imageUrl))
    }
    async setAbnormalImage(imageUrl: string) {
        this.abnormalImageUrl = imageUrl
        await AsyncStorage.setItem('abnormalImageUrl', String(imageUrl))
    }

    /** ✅ 서버에서 받은 정상 이미지 URL 가져오기 */
    async getNormalImage(): Promise<string | null> {
        if (!this.normalImageUrl) {
            const storedUrl = await AsyncStorage.getItem('normalImageUrl');
            if (storedUrl) {
                this.normalImageUrl = storedUrl;
            }
        }
        return this.normalImageUrl;
    }

    /** ✅ 서버에서 받은 틀린 이미지 URL 가져오기 */
    async getAbnormalImage(): Promise<string | null> {
        if (!this.abnormalImageUrl) {
            const storedUrl = await AsyncStorage.getItem('abnormalImageUrl');
            if (storedUrl) {
                this.abnormalImageUrl = storedUrl;
            }
        }
        return this.abnormalImageUrl;
    }

    async getRoomID() {
        if (!this.roomID) {
            const storedID = await AsyncStorage.getItem('roomID');
            this.roomID = storedID ? parseInt(storedID, 10) : null;
        }
        return this.roomID;
    }

    async getImageID() {
        if (!this.imageID) {
            const storedID = await AsyncStorage.getItem('imageID');
            this.imageID = storedID ? parseInt(storedID, 10) : null;
        }
        return this.imageID;
    }

    async getRound() {
        if (!this.round) {
            const storedID = await AsyncStorage.getItem('round');
            this.round = storedID ? parseInt(storedID, 10) : null;
        }
        return this.round;
    }
     
    // ✅ 게임 정보 저장
    setGameInfo(info: any) {
        this.gameInfo = info;
    }

    getGameInfo() {
        return this.gameInfo;
    }

    // ✅ 유저 목록 저장
    setUsers(users: any[]) {
        this.users = users;
    }

    getUsers() {
        return this.users;
    }

    // ✅ 게임 시작 가능 여부 확인
    shouldStartGame(): boolean {
        return this.gameInfo.allReady === true && this.gameInfo.isFull === true;
    }

    // ✅ 내가 방장인지 확인
    isOwner(userID: number): boolean {
        return this.users.some(user => user.id === userID && user.isOwner);
    }
}

export const gameService = new GameService();
