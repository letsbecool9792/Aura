module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // This option is required to polyfill the 'import.meta' syntax
          // which is used by the 'valtio' package and is not supported by Hermes by default.
          unstable_transformImportMeta: true,
        },
      ],
    ],
    // The plugins array is still here in case you need to add other plugins later.
    // For now, it is empty.
    plugins: [], 
  };
};
