
quat4.rotateX = function (quat, angle, dest) {
    if (!dest) { dest = quat; }

    angle *= 0.5; 

    var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3],
        qbx = Math.sin(angle), qbw = Math.cos(angle);

    dest[0] = qax * qbw + qaw * qbx;
    dest[1] = qay * qbw + qaz * qbx;
    dest[2] = qaz * qbw - qay * qbx;
    dest[3] = qaw * qbw - qax * qbx;
};

quat4.rotateY = function (quat, angle, dest) {
    if (!dest) { dest = quat; }

    // TODO: optimize this
    angle *= 0.5;

    quat4.multiply(quat,
                   [0, Math.sin(angle), 0, Math.cos(angle)],
                   dest);
};

quat4.rotateZ = function (quat, angle, dest) {
    if (!dest) { dest = quat; }

    // TODO: optimize this
    angle *= 0.5;

    quat4.multiply(quat,
                   [0, 0, Math.sin(angle), Math.cos(angle)],
                   dest);
};
