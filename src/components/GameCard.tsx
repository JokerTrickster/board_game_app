import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../styles/HomeStyles';

type GameCardProps = {
    title: string;
    hashtags: string[];
    onPress: () => void;
};

const GameCard: React.FC<GameCardProps> = ({ title, hashtags, onPress }) => {
    return (
        <TouchableOpacity style={styles.gameCard} onPress={onPress}>
            <View style={styles.imagePlaceholder} />
            <Text style={styles.gameTitle}>{title}</Text>
            <View style={styles.hashtagContainer}>
                {hashtags.map(tag => (
                    <Text key={tag} style={styles.hashtag}>{tag}</Text>
                ))}
            </View>
        </TouchableOpacity>
    );
};

export default GameCard;
