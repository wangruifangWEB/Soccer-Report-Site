import {X, Y, X2, Y2, SIZE, Channel} from '../../channel';
import {Orient} from '../../config';
import {isMeasure} from '../../fielddef';
import {BANDSIZE_FIT, ScaleType} from '../../scale';
import {contains} from '../../util';

import {applyColorAndOpacity} from '../common';
import {UnitModel} from '../unit';

export namespace bar {
  export function markType() {
    return 'rect';
  }

  export function properties(model: UnitModel) {
    // TODO Use Vega's marks properties interface
    let p: any = {};

    const orient = model.config().mark.orient;

    const stack = model.stack();
    const xFieldDef = model.encoding().x;
    const x2FieldDef = model.encoding().x2;

    const xIsMeasure = isMeasure(xFieldDef) || isMeasure(x2FieldDef);

    // x, x2, and width -- we must specify two of these in all conditions
    if (stack && X === stack.fieldChannel) {
      // 'x' is a stacked measure, thus use <field>_start and <field>_end for x, x2.
      p.x = {
        scale: model.scaleName(X),
        field: model.field(X, { suffix: 'start' })
      };
      p.x2 = {
        scale: model.scaleName(X),
        field: model.field(X, { suffix: 'end' })
      };
    } else if (xIsMeasure) {
      if (orient === Orient.HORIZONTAL) {
        if (model.has(X)) {
          p.x = {
            scale: model.scaleName(X),
            field: model.field(X)
          };
        } else {
          p.x = {
            scale: model.scaleName(X),
            value: 0
          };
        }

        if (model.has(X2)) {
          p.x2 = {
            scale: model.scaleName(X),
            field: model.field(X2)
          };
        } else {
          // Log / Time / UTC scale do not support zero
          if (contains([ScaleType.LOG, ScaleType.TIME, ScaleType.UTC], model.scale(X).type) ||
              model.scale(X).zero === false) {
            p.x2 = { value: 0 };
          } else {
            p.x2 = {
              scale: model.scaleName(X),
              value: 0
            };
          }

        }
      } else { // vertical
        p.xc = {
          scale: model.scaleName(X),
          field: model.field(X)
        };
        p.width = {value: sizeValue(model, X)};
      }
    } else { // x is dimension or unspecified
      if (model.has(X)) { // is ordinal
        if (model.encoding().x.bin) {
          if (model.has(SIZE) && orient !== Orient.HORIZONTAL) {
            // For vertical chart that has binned X and size,
            // center bar and apply size to width.
            p.xc = {
              scale: model.scaleName(X),
              field: model.field(X, { binSuffix: 'mid' })
            };
            p.width = {
              scale: model.scaleName(SIZE),
              field: model.field(SIZE)
            };
          } else {
            p.x = {
              scale: model.scaleName(X),
              field: model.field(X, { binSuffix: 'start' }),
              offset: 1
            };
            p.x2 = {
              scale: model.scaleName(X),
              field: model.field(X, { binSuffix: 'end' })
            };
          }
        } else if (model.scale(X).bandSize === BANDSIZE_FIT) {
          p.x = {
            scale: model.scaleName(X),
            field: model.field(X),
            offset: 0.5 // TODO offset or padding
          };
        } else {
          p.xc = {
            scale: model.scaleName(X),
            field: model.field(X)
          };
        }
     } else { // no x
        p.x = { value: 0, offset: 2 };
      }

      p.width = model.has(X) && model.scale(X).bandSize === BANDSIZE_FIT ? {
          scale: model.scaleName(X),
          band: true,
          offset: -0.5 // TODO offset or padding
        } : model.has(SIZE) && orient !== Orient.HORIZONTAL ? {
          // apply size scale if has size and is vertical (explicit "vertical" or undefined)
          scale: model.scaleName(SIZE),
          field: model.field(SIZE)
        } : {
          // otherwise, use fixed size
          value: sizeValue(model, (X))
        };
    }

    const yFieldDef = model.encoding().y;
    const y2FieldDef = model.encoding().y2;

    const yIsMeasure = isMeasure(yFieldDef) || isMeasure(y2FieldDef);
    // y, y2 & height -- we must specify two of these in all conditions
    if (stack && Y === stack.fieldChannel) { // y is stacked measure
      p.y = {
        scale: model.scaleName(Y),
        field: model.field(Y, { suffix: 'start' })
      };
      p.y2 = {
        scale: model.scaleName(Y),
        field: model.field(Y, { suffix: 'end' })
      };
    } else if (yIsMeasure) {
      if (orient !== Orient.HORIZONTAL) { // vertical (explicit 'vertical' or undefined)
        if (model.has(Y)) {
          p.y = {
            scale: model.scaleName(Y),
            field: model.field(Y)
          };
        } else {
          p.y = {
            scale: model.scaleName(Y),
            value: 0
          };
        }

        if (model.has(Y2)) {
          p.y2 = {
            scale: model.scaleName(Y),
            field: model.field(Y2)
          };
        } else {
          // Log / Time / UTC scale do not support zero
          if (contains([ScaleType.LOG, ScaleType.TIME, ScaleType.UTC], model.scale(Y).type) ||
              model.scale(Y).zero === false) {
            // end on axis
            p.y2 = {
              field: {group: 'height'}
            };
          } else {
            p.y2 = {
              scale: model.scaleName(Y),
              value: 0
            };
          }
        }
      } else {
        p.yc = {
          scale: model.scaleName(Y),
          field: model.field(Y)
        };
        p.height = { value: sizeValue(model, Y) };
      }
    } else { // y is ordinal or unspecified

      if (model.has(Y)) { // is ordinal
        if (model.encoding().y.bin) {
          if (model.has(SIZE) && orient === Orient.HORIZONTAL) {
            // For horizontal chart that has binned Y and size,
            // center bar and apply size to height.
            p.yc = {
              scale: model.scaleName(Y),
              field: model.field(Y, { binSuffix: 'mid' })
            };
            p.height = {
              scale: model.scaleName(SIZE),
              field: model.field(SIZE)
            };
          } else {
            // Otherwise, simply use <field>_start, <field>_end
            p.y = {
              scale: model.scaleName(Y),
              field: model.field(Y, { binSuffix: 'start' })
            };
            p.y2 = {
              scale: model.scaleName(Y),
              field: model.field(Y, { binSuffix: 'end' }),
              offset: 1
            };
          }
        } else if (model.scale(Y).bandSize === BANDSIZE_FIT) {
          p.y = {
            scale: model.scaleName(Y),
            field: model.field(Y),
            offset: 0.5 // TODO offset or padding
          };
        } else {
          p.yc = {
            scale: model.scaleName(Y),
            field: model.field(Y)
          };
        }
      } else { // No Y
        p.y2 = {
          field: { group: 'height' },
          offset: -1
        };
      }

      p.height = model.has(Y) && model.scale(Y).bandSize === BANDSIZE_FIT ? {
          scale: model.scaleName(Y),
          band: true,
          offset: -0.5 // TODO offset or padding
        } : model.has(SIZE)  && orient === Orient.HORIZONTAL ? {
          // apply size scale if has size and is horizontal
          scale: model.scaleName(SIZE),
          field: model.field(SIZE)
        } : {
          value: sizeValue(model, Y)
        };
    }

    applyColorAndOpacity(p, model);
    return p;
  }

  // TODO: make this a mixins
  function sizeValue(model: UnitModel, channel: Channel) {
    const fieldDef = model.encoding().size;
    if (fieldDef && fieldDef.value !== undefined) {
       return fieldDef.value;
    }

    const markConfig = model.config().mark;
    if (markConfig.barSize) {
      return markConfig.barSize;
    }
    // BAR's size is applied on either X or Y
    return model.isOrdinalScale(channel) ?
        // For ordinal scale or single bar, we can use bandSize - 1
        // (-1 so that the border of the bar falls on exact pixel)
        model.scale(channel).bandSize - 1 :
        // TODO: {band: true}
      !model.has(channel) ?
        model.config().scale.bandSize - 1 :
        // otherwise, set to thinBarWidth by default
        markConfig.barThinSize;
  }
}
