import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../styles/HomeStyles';

type GameCardProps = {
    title: string;
    hashtags: string[];
    image: any;
    onPress: () => void;
};

const GameCard: React.FC<GameCardProps> = ({ title, hashtags, image, onPress }) => {
    return (
        <TouchableOpacity style={styles.gameCard} onPress={onPress}>
            <Image source={image} style={styles.gameImage} />
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
