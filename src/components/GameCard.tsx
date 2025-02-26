import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../styles/HomeStyles';

type GameCardProps = {
    title: string;
    hashtag: string;
    category: string;
    image: string;
    onPress: () => void;
};

const GameCard: React.FC<GameCardProps> = ({ title, category,hashtag, image, onPress }) => {
    return (
        <TouchableOpacity style={styles.gameCard} onPress={onPress}>
            <Image source={{ uri: image }} style={styles.gameImage} />
            <Text style={styles.gameTitle}>{title}</Text>
            <View style={styles.hashtagContainer}>
                <Text style={styles.categoryText}>{category}</Text>
                <Text style={styles.separator}>|</Text>
                <Text style={styles.hashtagText}>#{hashtag}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default GameCard;
