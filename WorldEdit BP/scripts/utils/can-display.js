export const canDisplay = (player, vector, distanceLimit) => {
    // vector A를 축으로 vector B를 회전시킨 후 외적을 통해 벡터의 좌우를 비교해 시야에 포함되었는지 확인하는 코드
    const direction = {
        x: vector.x - player.location.x,
        y: vector.y - player.location.y,
        z: vector.z - player.location.z
    };
    const distanceSquared = direction.x ** 2 + direction.y ** 2 + direction.z ** 2;
    if (distanceSquared > distanceLimit ** 2)
        return false;
    const forward = player.getViewDirection();
    const radian = 90 * Math.PI / 180;
    const cosRadian = Math.cos(radian);
    const sinRadian = Math.sin(radian);
    const thetaX = Math.atan2(forward.z, forward.x);
    const cosThetaX = Math.cos(thetaX);
    const cosMThetaX = Math.cos(-thetaX);
    const sinThetaX = Math.sin(thetaX);
    const sinMThetaX = Math.sin(-thetaX);
    const flatForward = {
        x: forward.x * cosMThetaX - forward.z * sinMThetaX,
        y: forward.y,
        z: forward.x * sinMThetaX + forward.z * cosMThetaX
    };
    const thetaY = Math.atan2(flatForward.x, flatForward.y);
    const cosMThetaY = Math.cos(-thetaY);
    const sinMThetaY = Math.sin(-thetaY);
    const semiRight = {
        x: -cosRadian * sinMThetaY,
        y: cosRadian * cosMThetaY,
        z: sinRadian
    };
    const right = {
        x: semiRight.x * cosThetaX - semiRight.z * sinThetaX,
        y: semiRight.y,
        z: semiRight.x * sinThetaX + semiRight.z * cosThetaX
    };
    const semiLeft = {
        x: -cosRadian * sinMThetaY,
        y: cosRadian * cosMThetaY,
        z: Math.sin(-radian)
    };
    const left = {
        x: semiLeft.x * cosThetaX - semiLeft.z * sinThetaX,
        y: semiLeft.y,
        z: semiLeft.x * sinThetaX + semiLeft.z * cosThetaX
    };
    const normalUp = {
        x: -Math.sin(Math.PI / 2),
        y: Math.cos(Math.PI / 2),
        z: 0
    };
    const semiUp = {
        x: normalUp.x * cosMThetaY - normalUp.y * sinMThetaY,
        y: normalUp.x * sinMThetaY + normalUp.y * cosMThetaY,
        z: 0
    };
    const up = {
        x: semiUp.x * cosThetaX - semiUp.z * sinThetaX,
        y: semiUp.y,
        z: semiUp.x * sinThetaX + semiUp.z * cosThetaX
    };
    const rightCross = {
        x: direction.y * right.z - direction.z * right.y,
        y: direction.z * right.x - direction.x * right.z,
        z: direction.x * right.y - direction.y * right.x,
    };
    const leftCross = {
        x: direction.y * left.z - direction.z * left.y,
        y: direction.z * left.x - direction.x * left.z,
        z: direction.x * left.y - direction.y * left.x,
    };
    const rightResult = rightCross.x * up.x + rightCross.y * up.y + rightCross.z * up.z;
    const leftResult = leftCross.x * up.x + leftCross.y * up.y + leftCross.z * up.z;
    if (rightResult > 0 || leftResult < 0)
        return false;
    return true;
};
