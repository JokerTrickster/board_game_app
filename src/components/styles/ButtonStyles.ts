import { StyleSheet } from 'react-native';
import { responsive } from '../../utils';

export default StyleSheet.create({
    buttonContainer: {
        flex: 1,
        width: '100%',
        marginTop: responsive.verticalScale(-20),
        minHeight: responsive.touchTarget(), // Ensure accessibility compliance
    },

    text: {
        color: '#FFF',
        fontSize: responsive.font(16),
        fontWeight: 'bold',
    },
    
    disabled: {
        opacity: 0.5,
    },
});
