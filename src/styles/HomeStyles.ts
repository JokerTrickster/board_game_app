import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef6e4',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        alignItems: 'center',
    },
    profile: { flexDirection: 'row', alignItems: 'center' },
    profileImage: { width: 40, height: 40, borderRadius: 20 },
    profileInfo: { marginLeft: 8 },
    nickname: { fontWeight: 'bold', fontSize: 16 },
    level: { fontSize: 14, color: 'gray' },
    hearts: { flexDirection: 'row', alignItems: 'center' },
    heartCount: { marginLeft: 5, fontSize: 16 },
    settingsIcon: { padding: 10 },
    gameContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 10 },
    gameCard: {
        width: '45%',
        backgroundColor: '#fff',
        marginVertical: 8,
        borderRadius: 10,
        padding: 10,
        elevation: 4,
        alignItems: 'center',
    },
    gameImage: { width: '100%', height: 120, borderRadius: 8 },
    gameTitle: { marginTop: 10, fontWeight: 'bold', fontSize: 16 },
    hashtagContainer: { flexDirection: 'row', marginTop: 5 },
    hashtag: { marginHorizontal: 3, fontSize: 12, backgroundColor: '#eee', padding: 2, borderRadius: 5 },
    matchButton: {
        backgroundColor: '#6f96ff',
        padding: 15,
        alignItems: 'center',
        borderRadius: 20,
        margin: 20,
    },
    matchButtonText: { color: '#fff', fontSize: 18 },
});
