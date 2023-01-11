import {Bounds} from '../css/layout/bounds';
import {OBJECT_FIT} from '../css/property-descriptors/object-fit';
import {ObjectPosition} from '../css/property-descriptors/object-position';
import {getAbsoluteValueForTuple} from '../css/types/length-percentage';

export const calculateObjectFitBounds = (
    objectFit: OBJECT_FIT,
    objectPosition: ObjectPosition,
    naturalWidth: number,
    naturalHeight: number,
    clientWidth: number,
    clientHeight: number
): {src: Bounds; dest: Bounds} => {
    const naturalRatio = naturalWidth / naturalHeight;
    const clientRatio = clientWidth / clientHeight;

    // 'object-position' is not currently supported, so use default value of 50% 50%.
    const position = getAbsoluteValueForTuple(objectPosition, naturalWidth - clientWidth, naturalHeight - clientHeight);

    let srcX: number,
        srcY: number,
        srcWidth: number,
        srcHeight: number,
        destX: number,
        destY: number,
        destWidth: number,
        destHeight: number;

    if (objectFit === OBJECT_FIT.SCALE_DOWN) {
        objectFit =
            naturalWidth < clientWidth && naturalHeight < clientHeight
                ? OBJECT_FIT.NONE // src is smaller on both axes
                : OBJECT_FIT.CONTAIN; // at least one axis is greater or equal in size
    }

    switch (objectFit) {
        case OBJECT_FIT.CONTAIN:
            srcX = 0;
            srcY = 0;
            srcWidth = naturalWidth;
            srcHeight = naturalHeight;
            if (naturalRatio < clientRatio) {
                // snap to top/bottom
                destY = 0;
                destHeight = clientHeight;
                destWidth = destHeight * naturalRatio;
                destX = position[0];
            } else {
                // snap to left/right
                destX = 0;
                destWidth = clientWidth;
                destHeight = destWidth / naturalRatio;
                destY = position[1];
            }
            break;

        case OBJECT_FIT.COVER:
            destX = 0;
            destY = 0;
            destWidth = clientWidth;
            destHeight = clientHeight;
            if (naturalRatio < clientRatio) {
                // fill left/right
                srcX = 0;
                srcWidth = naturalWidth;
                srcHeight = clientHeight * (naturalWidth / clientWidth);
                srcY = position[1];
            } else {
                // fill top/bottom
                srcY = 0;
                srcHeight = naturalHeight;
                srcWidth = clientWidth * (naturalHeight / clientHeight);
                srcX = position[0];
            }
            break;

        case OBJECT_FIT.NONE:
            if (naturalWidth < clientWidth) {
                srcX = 0;
                srcWidth = naturalWidth;
                destX = position[0];
                destWidth = naturalWidth;
            } else {
                srcX = position[0];
                srcWidth = clientWidth;
                destX = 0;
                destWidth = clientWidth;
            }
            if (naturalHeight < clientHeight) {
                srcY = 0;
                srcHeight = naturalHeight;
                destY = position[1];
                destHeight = naturalHeight;
            } else {
                srcY = position[1];
                srcHeight = clientHeight;
                destY = 0;
                destHeight = clientHeight;
            }
            break;

        case OBJECT_FIT.FILL:
        default:
            srcX = 0;
            srcY = 0;
            srcWidth = naturalWidth;
            srcHeight = naturalHeight;
            destX = 0;
            destY = 0;
            destWidth = clientWidth;
            destHeight = clientHeight;
            break;
    }

    return {
        src: new Bounds(srcX, srcY, srcWidth, srcHeight),
        dest: new Bounds(destX, destY, destWidth, destHeight)
    };
};
