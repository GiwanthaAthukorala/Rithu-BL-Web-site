function hammingDistance(str1, str2) {
  let dist = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) dist++;
  }
  return dist;
}

module.exports = function isSimilarHash(hash1, hash2, threshold = 2) {
  if (!hash1 || !hash2) return false;
  const distance = hammingDistance(hash1, hash2);
  return distance <= threshold;
};
