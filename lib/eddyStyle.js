const SMALL_CAPS = {
    a: '\u1D00',
    b: '\u0299',
    c: '\u1D04',
    d: '\u1D05',
    e: '\u1D07',
    f: '\uA730',
    g: '\u0262',
    h: '\u029C',
    i: '\u026A',
    j: '\u1D0A',
    k: '\u1D0B',
    l: '\u029F',
    m: '\u1D0D',
    n: '\u0274',
    o: '\u1D0F',
    p: '\u1D18',
    q: 'q',
    r: '\u0280',
    s: 's',
    t: '\u1D1B',
    u: '\u1D1C',
    v: '\u1D20',
    w: '\u1D21',
    x: 'x',
    y: '\u028F',
    z: '\u1D22'
};

function toSmallCaps(text = '') {
    return String(text || '')
        .split('')
        .map((char) => SMALL_CAPS[char.toLowerCase()] || char)
        .join('');
}

function line(icon, text) {
    return `${icon} *${toSmallCaps(text)}*`;
}

function ok(text) {
    return line('\u2705', text);
}

function fail(text) {
    return line('\u274c', text);
}

function warn(text) {
    return line('\u26a0\ufe0f', text);
}

function info(text) {
    return line('\u2139\ufe0f', text);
}

function usage(title, lines = []) {
    return [`\u2699\ufe0f *${toSmallCaps(title)}*`, '', ...lines].join('\n');
}

module.exports = {
    toSmallCaps,
    ok,
    fail,
    warn,
    info,
    usage
};
