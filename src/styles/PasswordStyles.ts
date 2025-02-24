import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    goBack: {
        fontSize: 16,
        marginBottom: 20,
        color: '#000',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        borderColor: '#ccc',
        marginRight: 10,
    },
    button: {
        padding: 10,
        backgroundColor: '#4A90E2',
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
    },
    submitButton: {
        marginTop: 20,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});
