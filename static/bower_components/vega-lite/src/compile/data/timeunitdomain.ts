import {Channel} from '../../channel';
import {dateTimeExpr, DateTimeExpr} from '../../datetime';
import {FieldDef} from '../../fielddef';
import {TimeUnit, imputedDomain} from '../../timeunit';
import {extend, keys, StringSet} from '../../util';
import {VgData} from '../../vega.schema';

import {FacetModel} from './../facet';
import {LayerModel} from './../layer';
import {Model} from './../model';

import {DataComponent} from './data';


export namespace timeUnitDomain {
  function parse(model: Model): StringSet {
    return model.reduce(function(timeUnitDomainMap, fieldDef: FieldDef, channel: Channel) {
      if (fieldDef.timeUnit) {
        const domain = imputedDomain(fieldDef.timeUnit, channel);
        if (domain) {
          timeUnitDomainMap[fieldDef.timeUnit] = true;
        }
      }
      return timeUnitDomainMap;
    }, {});
  }

  export const parseUnit: (model: Model) => StringSet = parse;

  export function parseFacet(model: FacetModel) {
    // always merge with child
    return extend(parse(model), model.child().component.data.timeUnitDomain);
  }

  export function parseLayer(model: LayerModel) {
    // always merge with children
    return extend(parse(model), model.children().forEach((child) => {
      return child.component.data.timeUnitDomain;
    }));
  }

  export function assemble(component: DataComponent): VgData[] {
    return keys(component.timeUnitDomain).reduce(function(timeUnitData, tu: any) {
      const timeUnit: TimeUnit = tu; // cast string back to enum
      const domain = imputedDomain(timeUnit, null); // FIXME fix rawDomain signature
      if (domain) {
        let datetime: DateTimeExpr = {};
        datetime[timeUnit] = 'datum["data"]';

        timeUnitData.push({
          name: timeUnit,
          values: domain,
          transform: [{
            type: 'formula',
            field: 'date',
            expr: dateTimeExpr(datetime)
          }]
        });
      }
      return timeUnitData;
    }, []);
  }
}
