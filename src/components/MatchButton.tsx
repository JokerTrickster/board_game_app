import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../styles/ReactHomeStyles';

type MatchButtonProps = {
    onPress: () => void;
};

const MatchButton: React.FC<MatchButtonProps> = ({ onPress }) => (
    <TouchableOpacity style={styles.matchButton} onPress={onPress}>
        <Text style={styles.matchButtonText}>매칭하기</Text>
    </TouchableOpacity>
);

export default MatchButton;
