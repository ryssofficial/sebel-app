module.exports = function(api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        // Hapus baris plugins reanimated di sini
    };
};