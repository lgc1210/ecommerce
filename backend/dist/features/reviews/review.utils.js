/** Làm tròn điểm đánh giá trung bình về 1 chữ số thập phân, giữ nguyên null nếu chưa có đánh giá nào */
export function roundRating(average) {
    if (average === null || average === undefined)
        return null;
    return Math.round(average * 10) / 10;
}
//# sourceMappingURL=review.utils.js.map