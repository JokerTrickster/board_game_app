import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    gameOverTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#dc3545', // 빨간색
        marginBottom: 20,
    },
    gameOverText: {
        fontSize: 20,
        color: '#333',
        marginBottom: 10,
    },
    mainButton: {
        marginTop: 30,
        backgroundColor: '#007bff', // 파란색
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    mainButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
});
