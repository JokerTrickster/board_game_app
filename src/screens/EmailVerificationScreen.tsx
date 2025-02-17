import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes';
import styles from '../styles/EmailVerificationStyles';
type EmailVerificationRouteProp = RouteProp<RootStackParamList, 'EmailVerification'>;

const EmailVerificationScreen: React.FC<{ route: EmailVerificationRouteProp }> = ({ route }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'EmailVerification'>>();
    const [code, setCode] = useState('');
    const { email } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>이메일 인증</Text>
            <Text>{email} 로 전송된 코드를 입력하세요.</Text>
            <TextInput style={styles.input} placeholder="인증 코드" value={code} onChangeText={setCode} />
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>인증</Text>
            </TouchableOpacity>
        </View>
    );
};
export default EmailVerificationScreen;
