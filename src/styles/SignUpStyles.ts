import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff' },
    backButton: { marginTop: 10, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 20 },
    input: { flex: 1, fontSize: 16, paddingVertical: 10 },
    smallButton: { padding: 6, backgroundColor: 'white', borderRadius: 8 },
    smallButtonText: { fontSize: 14, fontWeight: 'bold' },
    icon: { color: '#555', marginRight: 10 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
    checkboxText: { flex: 1, fontSize: 14, marginLeft:10 },
    linkText: { color: 'blue', textDecorationLine: 'underline' },
    signupButton: { backgroundColor: '#FFD700', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    signupButtonText: { fontSize: 18, fontWeight: 'bold' },
});
