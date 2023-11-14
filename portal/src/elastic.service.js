import HTTPService from "./http.service";
import * as esb from 'elastic-builder';
import {isEmpty, first} from 'lodash';

export default class ElasticService {
  constructor({router, configuration}) {
    this.router = router;
    this.searchRoute = '/search/index';
    this.indexRoute = '/items';
    this.aggs = this.prepareAggregations(configuration.ui.aggregations)
    this.highlightFields = configuration.ui.searchHighlights;
    this.highlighConfig = configuration.ui.hightlight || {};
    this.fields = configuration.ui.searchFields;
  }

  prepareAggregations(aggregations) {
    const a = {};
    for (let agg of aggregations) {
      a[agg['name']] = {"terms": {"field": agg['field'], "size": 1000}};
    }
    return a;
  }


  async multi({multi, filters, aggs, searchFields, sort, order, operation, pageSize, searchFrom, queries}) {
    try {
      const httpService = new HTTPService({router: this.router, loginPath: '/login'});
      let route = this.searchRoute + this.indexRoute;
      let sorting;
      if (sort === 'relevance') {
        sorting = [{
          _score: {
            order: order
          }
        }]
      } else {
        sorting = [{
          _script: {
            type: "number",
            order: order,
            script: {
              lang: 'painless',
              source: `doc['${sort}'].size() > 0 ? 1 : 0`
            }
          }
        }];
        // const sortField = {};
        // sortField[`${sort}.@value.keyword`] = {order};
        // sorting.push(sortField);
      }
      let body = {
        query: {},
        sort: sorting
      }
      // console.log('sorting');
      // console.log(JSON.stringify(sorting));
      let query;
      if (queries) {
        query = this.disMaxQuery({queries, filters});
      } else {
        query = this.boolQuery({
          searchQuery: multi,
          fields: searchFields,
          filters,
          operation
        });
      }
      //console.log(query);
      body.highlight = this.highlights(this.highlightFields);
      body.query = query;
      if (aggs) {
        body.aggs = aggs;
      } else {
        body.aggs = this.aggs
      }
      body['size'] = pageSize;
      body['from'] = searchFrom;
      body['track_total_hits'] = true;
      // console.log('multi query')
      // console.log(JSON.stringify(body));
      let response = await httpService.post({route, body})
      if (response.status !== 200) {
        //httpService.checkAuthorised({status: response.status});
        //TODO: Return an exact error from the API.
        const error = await response.json();
        const msg = 'Query Error: ' + error?.message || 'There was an error with your query'
        throw new Error(msg);
      } else {
        const results = await response.json();
        //console.log(results);
        return results;
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async single({index, id, _crateId, _id}) {
    const httpService = new HTTPService({router: this.router, loginPath: '/login'});
    let route = this.searchRoute + this.indexRoute;
    if (index) {
      route = this.searchRoute + '/' + index;
    }
    let body = {
      aggs: this.aggs, // maybe we dont need to send aggregations
      query: {}
    }
    if (_id) {
      body.query = {
        match: {
          _id: decodeURIComponent(_id)
        }
      }
    } else {
      body.query = {
        dis_max: {
          queries: [
            {match: {'@id': decodeURIComponent(id)}},
            {match: {'_crateId': decodeURIComponent(_crateId)}}
          ]
        }
      }
    }

    // const query = this.boolQuery({ fields: this.fields, filters:[] });
    console.log(JSON.stringify(body.query));
    // body.highlight = this.highlights(this.highlightFields);
    // body.query.bool.must.push(query);

    let response = await httpService.post({route, body});
    if (response.status !== 200) {
      //httpService.checkAuthorised({status: response.status});
      throw new Error(response.statusText);
    } else {
      const results = await response.json();
      console.log(first(results?.hits?.hits));
      return first(results?.hits?.hits);
    }
  }

  boolQuery({searchQuery, fields, filters, operation}) {
    //console.log('bool query');
    const filterTerms = this.termsQuery(filters);
    let boolQueryObj = {};
    if (isEmpty(searchQuery) && filterTerms.length > 0) {
      boolQueryObj = esb.boolQuery().filter(filterTerms);
    } else if (!isEmpty(searchQuery) && filterTerms.length > 0) {
      let multiFields = []
      for (let [key, value] of Object.entries(fields)) {
        if (value.checked) {
          multiFields.push(key);
        }
      }
      let phraseQuery = esb.multiMatchQuery(multiFields, searchQuery).type('best_fields');
      boolQueryObj = switchFilter(operation, boolQueryObj, phraseQuery, filterTerms);
    } else if (!isEmpty(searchQuery) && filterTerms.length <= 0) {
      let multiFields = []
      for (let [key, value] of Object.entries(fields)) {
        if (value.checked) {
          multiFields.push(key);
        }
      }
      let phraseQuery = esb.multiMatchQuery(multiFields, searchQuery).type('best_fields');
      boolQueryObj = switchFilter(operation, boolQueryObj, phraseQuery, filterTerms);
    } else if (isEmpty(searchQuery) && filterTerms.length <= 0) {
      boolQueryObj = esb.matchAllQuery();
    }
    const esbQuery = esb.requestBodySearch().query(boolQueryObj)
    const query = esbQuery.toJSON().query;
    // console.log(JSON.stringify({query: query}))
    return query;
  }

  highlights(highlightFields) {
    const esbQuery = esb.requestBodySearch()
      .query(esb.matchQuery('not', 'important'))
      .highlight(esb.highlight()
        .numberOfFragments(3)
        .fragmentSize(200)
        .fields(highlightFields)
        .preTags('<mark class="font-bold">')
        .postTags('</mark>')
      );

    const query = esbQuery.toJSON().query;
    let highlight = esbQuery.toJSON().highlight;
    highlight = {...highlight, ...this.highlighConfig};
    return highlight;
  }

  disMaxQuery({queries, filters}) {
    const filterTerms = this.termsQuery(filters);
    const esbQueries = [];
    const mustDMQueries = [];
    const mustBoolQueries = [];
    const shouldDMQueries = [];
    const shouldBoolQueries = [];
    const mustNotDMQueries = [];
    const mustNotBoolQueries = [];
    const boolQuery = esb.boolQuery();
    if (queries.queryString) {
      boolQuery.must(esb.queryStringQuery(queries.queryString));
      // boolQuery.must(esb.queryStringQuery(queries.queryString).escape(true));
      //boolQuery.must(esb.simpleQueryStringQuery(queries.queryString));
    } else {
      //Note: this code below is never used. Delete
      for (let q of queries) {
        if (q.operation === 'must') {
          if (q.multiField) {
            mustDMQueries.push(esb.multiMatchQuery(q.fields, q.query).operator('or').type(q.type));
          } else {
            let b = esb.matchQuery(q.fields, q.query);
            if (q.type === 'phrase_prefix') {
              b = esb.matchPhrasePrefixQuery(q.fields, q.query);
            }
            if (q.type === 'wildcard') {
              b = esb.wildcardQuery(q.fields, q.query);
            }
            if (q.type === 'regex') {
              b = esb.regexpQuery(q.fields, q.query).caseInsensitive(true);
            }
            mustBoolQueries.push(esb.boolQuery().must(b));
          }
        }
        if (q.operation === 'should') {
          if (q.multiField) {
            shouldDMQueries.push(esb.multiMatchQuery(q.fields, q.query).operator('or').type(q.type));
          } else {
            let b = esb.matchQuery(q.fields, q.query);
            if (q.type === 'phrase_prefix') {
              b = esb.matchPhrasePrefixQuery(q.fields, q.query);
            }
            if (q.type === 'wildcard') {
              b = esb.wildcardQuery(q.fields, q.query);
            }
            if (q.type === 'regex') {
              b = esb.regexpQuery(q.fields, q.query).caseInsensitive(true);
            }
            shouldBoolQueries.push(esb.boolQuery().must(b));
          }
        }
        if (q.operation === 'must_not') {
          if (q.multiField) {
            mustNotDMQueries.push(esb.multiMatchQuery(q.fields, q.query).operator('or').type(q.type));
          } else {
            let b = esb.matchQuery(q.fields, q.query);
            if (q.type === 'phrase_prefix') {
              b = esb.matchPhrasePrefixQuery(q.fields, q.query);
            }
            if (q.type === 'wildcard') {
              b = esb.wildcardQuery(q.fields, q.query);
            }
            if (q.type === 'regex') {
              b = esb.regexpQuery(q.fields, q.query).caseInsensitive(true);
            }
            mustNotBoolQueries.push(esb.boolQuery().must(b));
          }
        }
      }
      if (mustDMQueries.length > 0) {
        boolQuery.must(
          esb.disMaxQuery().queries(mustDMQueries)
        )
      }
      if (mustBoolQueries.length > 0) {
        boolQuery.must(mustBoolQueries)
      }
      if (shouldDMQueries.length > 0) {
        boolQuery.should(
          esb.disMaxQuery().queries(shouldDMQueries)
        )
      }
      if (shouldBoolQueries.length > 0) {
        boolQuery.should(shouldBoolQueries)
      }
      if (mustNotDMQueries.length > 0) {
        boolQuery.mustNot(
          esb.disMaxQuery().queries(mustNotDMQueries)
        )
      }
      if (mustNotBoolQueries.length > 0) {
        boolQuery.mustNot(mustNotBoolQueries);
      }
    }
    boolQuery.filter(filterTerms);
    boolQuery.minimumShouldMatch(0);
    const esbQuery = esb.requestBodySearch().query(boolQuery)
    const query = esbQuery.toJSON().query;
    console.log(JSON.stringify({query: query}))
    return query;
  }

  termsQuery(filters) {
    let filterTerms = [];
    //console.log(JSON.stringify(filters));
    for (let bucket of Object.keys(filters)) {
      if (filters[bucket].length > 0 || (filters[bucket]?.v && filters[bucket].v.length > 0)) {
        //TODO: send the type of field in the filters
        let field = '';
        let type;
        if (!filters[bucket]?.t) {
          field = bucket.concat('.keyword');
        } else {
          type = filters[bucket]?.t;
          field = bucket.concat('.' + type);
        }
        let values = filters[bucket]?.v || filters[bucket];
        //console.log(values)
        filterTerms.push(esb.termsQuery(field, values));
      }
    }
    return filterTerms;
  }

  queryString(searchGroup) {
    let qS = '';
    searchGroup.forEach((sg, i) => {
      let lastOneSG = false;
      if (i + 1 === searchGroup.length) {
        lastOneSG = true;
      }
      if (isEmpty(sg.searchInput)) {
        sg.searchInput = '*';
      }
      if (sg.field === 'all_fields') {
        let qqq = '( ';
        Object.keys(this.fields).map((f, index, keys) => {
          let lastOne = false;
          if (index + 1 === keys.length) {
            lastOne = true;
          }
          let qq = '';
          qq = String.raw`${f} : ${sg.searchInput} ${!lastOne ? 'OR' : ''} `;
          qqq += qq;
        });
        qS += String.raw`${qqq} ) ${!lastOneSG ? sg.operation : ''} `;
      } else {
        qS += String.raw` ( ${sg.field}: ${sg.searchInput} ) ${!lastOneSG ? sg.operation : ''}`;
      }
    });
    return qS;
  }
}

function switchFilter(operation, boolQueryObj, phraseQuery, filterTerms) {
  switch (operation) {
    case 'must':
      boolQueryObj = esb.boolQuery().must(phraseQuery).filter(filterTerms);
      break;
    case 'should':
      boolQueryObj = esb.boolQuery().should(phraseQuery).filter(filterTerms);
      break;
    case 'must_not':
      boolQueryObj = esb.boolQuery().mustNot(phraseQuery).filter(filterTerms);
      break;
    default:
      boolQueryObj = esb.boolQuery().should(phraseQuery).filter(filterTerms);
  }
  return boolQueryObj;
}
