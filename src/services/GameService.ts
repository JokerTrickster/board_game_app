import AsyncStorage from '@react-native-async-storage/async-storage';

class GameService {
    private roomID: number | null = null;
    private users: any[] = [];
    private imageID: number | null = null;
    private gameInfo: any = {};

    // ✅ roomID 저장 (매칭 시 사용)
    async setRoomID(id: number) {
        this.roomID = id;
        await AsyncStorage.setItem('roomID', String(id));
    }
    async setImageID(id: number){
        this.imageID = id;
        await AsyncStorage.setItem('imageID', String(id));
    }
    // ✅ roomID 가져오기
    async getRoomID() {
        if (!this.roomID) {
            const storedID = await AsyncStorage.getItem('roomID');
            if (storedID) {
                this.roomID = parseInt(storedID, 10);
            }
        }
        return this.roomID;
    }
    // ✅  imageID 가져오기
    async getImageID() {
        if (!this.imageID) {
            const storedID = await AsyncStorage.getItem('imageID');
            if (storedID) {
                this.imageID = parseInt(storedID, 10);
            }
        }
        return this.imageID;
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
