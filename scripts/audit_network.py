#!/usr/bin/env python3
"""Read-only structural SEO/accessibility/link audit of four sibling checkouts."""
import argparse
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit
import json
import xml.etree.ElementTree as ET

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.links=[]; self.canonical=[]; self.alternates={}; self.ids=[]
        self.h1=0; self.lang=''; self.description=''; self.title=''; self.in_title=False
        self.unsafe_blank=[]; self.missing_alt=[]
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='html': self.lang=a.get('lang','')
        if tag=='title': self.in_title=True
        if tag=='h1': self.h1+=1
        if tag=='meta' and a.get('name')=='description': self.description=a.get('content','')
        if 'id' in a: self.ids.append(a['id'])
        if tag=='link' and a.get('rel')=='canonical': self.canonical.append(a.get('href'))
        if tag=='link' and a.get('rel')=='alternate' and 'hreflang' in a: self.alternates[a['hreflang']]=a.get('href')
        if tag=='a' and a.get('target')=='_blank' and 'noopener' not in a.get('rel','').split(): self.unsafe_blank.append(a.get('href'))
        if tag=='img' and 'alt' not in a: self.missing_alt.append(a.get('src'))
        for key in ['href','src']:
            if key in a: self.links.append(a[key])
    def handle_endtag(self,tag):
        if tag=='title': self.in_title=False
    def handle_data(self,data):
        if self.in_title: self.title+=data

def audit(checkouts):
    portal=checkouts/'qexus.github.io'; host='https://qexus.github.io'
    def local(path):
        parts=path.lstrip('/').split('/'); repo=parts[0]
        if repo in ['fisheries','fisheries-ca','manac']:
            base=checkouts/repo
            if repo!='manac': base/='public'
            tail='/'.join(parts[1:])
        else: base=portal; tail=path.lstrip('/')
        return base/(tail+'index.html' if not tail or tail.endswith('/') else tail)
    urls=[u.text for u in ET.parse(portal/'sitemap.xml').findall('.//{*}loc')]
    pages={}; errors=[]; warnings=[]; links=0
    for url in urls:
        path=local(urlsplit(url).path)
        if not path.is_file(): errors.append([url,'Missing HTML']); continue
        p=Page(path.read_text()); pages[url]=p
        if p.canonical!=[url]: errors.append([url,'Wrong canonical',p.canonical])
        if not p.title or not p.description or p.lang not in ['ru','fr','uk']: errors.append([url,'Missing title, description or language'])
        if p.h1!=1: warnings.append([url,'H1 count',p.h1])
        if len(p.ids)!=len(set(p.ids)): errors.append([url,'Duplicate IDs'])
        if p.unsafe_blank: errors.append([url,'Unprotected new window links',p.unsafe_blank])
        if p.missing_alt: errors.append([url,'Images without alt',p.missing_alt])
        for link in p.links:
            dest=urlsplit(urljoin(url,link))
            if dest.scheme not in ['https','http'] or dest.netloc!='qexus.github.io': continue
            links+=1
            target=local(dest.path)
            if not target.is_file(): errors.append([url,'Missing internal resource',str(target)])
            elif dest.fragment and target.suffix=='.html':
                ids=Page(target.read_text()).ids
                if dest.fragment not in ids: warnings.append([url,'Fragment generated dynamically or missing',dest.fragment])
    for url,p in pages.items():
        for lang in ['ru','fr','uk']:
            target=p.alternates.get(lang)
            other=pages.get(target)
            if not other or other.alternates.get(p.lang)!=url: errors.append([url,'Nonreciprocal hreflang',lang,target])
    for label,key in [('title','title'),('description','description')]:
        counts=Counter(getattr(p,key) for p in pages.values())
        for value,count in counts.items():
            if count>1: warnings.append(['Repeated '+label,count,value])
    return {'pages':len(pages),'internal_links_and_assets':links,'errors':errors,'warnings':warnings}

if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--checkouts',type=Path,default=Path(__file__).resolve().parents[2]); parser.add_argument('--output',type=Path)
    args=parser.parse_args(); result=audit(args.checkouts)
    if args.output: args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(result,ensure_ascii=False,indent=2))
    raise SystemExit(bool(result['errors']))
