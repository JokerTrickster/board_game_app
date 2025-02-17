import { StyleSheet } from 'react-native';

const EmailVerificationStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },
    text: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10
    },
    input: {
        width: '80%',
        height: 40,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        padding: 5,
        textAlign: 'center'
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: '80%',
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16
    }
});

export default EmailVerificationStyles;
