import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { HappyHuesTheme } from '../Constants/Theme';

export default function CustomDrawer(props) {
    return (
        <DrawerContentScrollView {...props} style={{ backgroundColor: HappyHuesTheme.background }}>
        {/* Header Drawer Bergaya Brutalist */}
        <View style={styles.drawerHeader}>
            <View style={styles.avatarBorder}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>AS</Text>
                </View>
            </View>
            <Text style={styles.userName}>Arisula</Text>
            <Text style={styles.userRole}>Siswa Kelas XII</Text>
        </View>

        {/* List Menu Asli dari Navigator */}
        <View style={styles.menuList}>
            <DrawerItemList {...props} />
        </View>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        padding: 20,
        backgroundColor: HappyHuesTheme.tertiary,
        borderBottomWidth: 4,
        borderBottomColor: HappyHuesTheme.stroke,
        marginBottom: 10,
    },
    avatarBorder: {
        width: 60,
        height: 60,
        backgroundColor: HappyHuesTheme.stroke,
        marginBottom: 10,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: HappyHuesTheme.highlight,
        borderWidth: 2,
        borderColor: HappyHuesTheme.stroke,
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 4,
        right: 4,
    },
    avatarText: {
        fontWeight: '900',
        fontSize: 20,
        color: HappyHuesTheme.stroke,
    },
    userName: {
        color: HappyHuesTheme.headline,
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    userRole: {
        color: HappyHuesTheme.paragraph,
        fontSize: 12,
    },
    menuList: {
        flex: 1,
        paddingTop: 10,
    }
});