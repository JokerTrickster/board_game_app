import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBF4E7',
        paddingHorizontal: 16,
    },
    backButton: {
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    gameTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 12,
        color: '#333',
    },
    gameImage: {
        width: '100%',  // ✅ 가로 전체 차지
        height: 200,     // ✅ 높이 지정
        resizeMode: 'contain',
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: '#ddd', // ✅ 이미지가 없을 경우 배경 색상
    },
    detailContainer: {
        alignItems: 'center',
    },
    summaryCard: {
        width: '90%',
        height: 180,
        backgroundColor: '#FFF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryText: {
        fontSize: 18,
        color: '#555',
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
    },
    infoCard: {
        width: '48%',
        height: 120,
        backgroundColor: '#FFF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    infoText: {
        fontSize: 16,
        color: '#555',
    },
    actionCard: {
        width: '90%',
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#555',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginVertical: 16,
    },
    matchButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#FFB6C1',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    togetherButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#FFDDC1',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    
});
