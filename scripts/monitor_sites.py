#!/usr/bin/env python3
"""Public, read-only health check of qexus lab websites and JSON snapshots.

Designed for GitHub Actions. Fails on inaccessible sites or implausible
registry loss; warns on outdated data and unconnected vacancy feeds.
"""
import argparse
import datetime as dt
import json
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

BASE="https://qexus.github.io"
SITE_PATHS={"/": "qexus lab", "/fisheries/":"Fisheries", "/fisheries-ca/":"Fisheries","/privacy.html":"Приватность","/status.html":"Состояние проектов"}
JSON_PATHS={"/fisheries/generated/registry.json":("Norway","companies","vessels"),
            "/fisheries-ca/generated/registry.json":("Canada","companies","aquaculture")}
UTC=dt.timezone.utc
def iso(text):
    try:
        d=dt.datetime.fromisoformat(str(text).replace("Z","+00:00"))
        return d.astimezone(UTC) if d.tzinfo else None
    except (TypeError,ValueError):
        return None

def verify_registry(region,doc,now=None):
    now=now or dt.datetime.now(UTC)
    errors=[];warnings=[]
    if not isinstance(doc,dict):
        return ["Invalid JSON object"],[]
    counts=[len(doc.get(k,[])) if isinstance(doc.get(k),list) else -1 for k in ("companies","vessels" if region=="Norway" else "aquaculture")]
    minimum=(300,100) if region=="Norway" else (200,100)
    if any(x<bound for x,bound in zip(counts,minimum)):
        errors.append(region+": unexpected decline in public registry counts: "+str(counts))
    status=doc.get("status")
    if status not in ("updated","fresh","partial","stale"):
        errors.append(region+": unhealthy registry status "+str(status))
    if status in ("partial","stale"):
        warnings.append(region+": source partially unavailable or stale")
    d=iso(doc.get("generated_at"))
    if not d:
        errors.append(region+": missing timestamp")
    else:
        days=(now-d).total_seconds()/86400
        if days>16:errors.append(region+": last build older than 16 days")
        elif days>10:warnings.append(region+": last build older than 10 days")
        if days< -2:errors.append(region+": future generated_at timestamp")
    source=doc.get("source_status",doc.get("sources",{}))
    if isinstance(source,dict):
        if any(x in ("stale","unavailable","error") for x in source.values()):
            warnings.append(region+": at least one official source not fresh")
    return errors,warnings

def verify_certification_index(doc, now=None):
    """Warn when source-dependent job/qualification advice is due for review."""
    now=now or dt.datetime.now(UTC)
    errors=[];warnings=[]
    if not isinstance(doc,dict):return ["Invalid qualification index"],[]
    if any(len(doc.get("roles",{}).get(country,[]))<7 for country in ("canada","norway")):
        errors.append("Qualification matrix lost required role records")
    date=doc.get("checked")
    try:
        checked=dt.date.fromisoformat(date)
        elapsed=(now.date()-checked).days
        if elapsed>45:warnings.append("Certificate and employer links last verified "+str(elapsed)+" days ago; manual review due")
        if elapsed < -2:warnings.append("Qualification review date appears to be in future")
    except (TypeError,ValueError):
        errors.append("Missing manual qualification review date")
    return errors,warnings

def fetch(url,timeout=20):
    request=Request(url,headers={"User-Agent":"qexus-site-monitor/1.0 (+https://github.com/qexus)"})
    last=None
    for i in range(2):
        try:
            with urlopen(request,timeout=timeout) as r:
                if r.status!=200:raise ValueError("HTTP "+str(r.status))
                body=r.read(6_000_001)
                if len(body)>6_000_000:raise ValueError("Document too large")
                return body.decode("utf-8",errors="replace")
        except (ValueError,HTTPError,URLError,TimeoutError) as e:
            last=e
            if i==0:time.sleep(2)
    raise RuntimeError(str(last))

def check_all():
    result={"timestamp":dt.datetime.now(UTC).isoformat(),"errors":[],"warnings":[],"checks":[]}
    for path,text in SITE_PATHS.items():
        try:
            data=fetch(BASE+path)
            if text.casefold() not in data.casefold():
                result["warnings"].append(path+": page content marker not found")
            result["checks"].append(path+": reachable")
        except Exception as e:
            result["errors"].append(path+": "+str(e))
    for path,(country,_,_) in JSON_PATHS.items():
        try:
            body=json.loads(fetch(BASE+path))
            errors,warnings=verify_registry(country,body)
            result["errors"]+=errors;result["warnings"]+=warnings
            result["checks"].append(country+" registry "+str(body.get("status")))
        except Exception as e:
            result["errors"].append(path+": "+str(e))
    try:
        ref=fetch(BASE+"/fisheries/reference-data.js").split("window.qexusFisheriesReference=",1)[1].strip().rstrip(";")
        status=json.loads(ref)
        errors,warnings=verify_certification_index(status)
        result["errors"]+=errors;result["warnings"]+=warnings
        result["checks"].append("Qualification and pricing reference date: "+str(status.get("checked")))
    except Exception as e:
        result["errors"].append("Qualification source index unavailable: "+str(e))
    for path in ("/shared/fisheries-core.js","/shared/fisheries-core.css"):
        try:
            data=fetch(BASE+path)
            if len(data)<100:result["errors"].append(path+": unexpectedly short")
            result["checks"].append(path+": reachable")
        except Exception as e:
            result["errors"].append(path+": "+str(e))
    for path in ("/fisheries/generated/jobs.json","/fisheries-ca/generated/jobs.json"):
        try:
            data=json.loads(fetch(BASE+path))
            if data.get("status")=="not_connected":
                result["warnings"].append(path+": authorized vacancy feed not connected; showing official search")
            if not isinstance(data.get("verified_live"),list):
                result["errors"].append(path+": invalid vacancy schema")
            result["checks"].append(path+": "+str(data.get("status")))
        except Exception as e:
            result["errors"].append(path+": "+str(e))
    return result

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--output",default="site-health.json")
    args=p.parse_args()
    result=check_all()
    from pathlib import Path
    Path(args.output).write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("qexus health: "+str(len(result["errors"]))+" errors, "+str(len(result["warnings"]))+" warnings")
    for item in result["checks"]:print("OK",item)
    for item in result["warnings"]:print("::warning::"+item)
    for item in result["errors"]:print("::error::"+item)
    return 1 if result["errors"] else 0
if __name__=="__main__":
    sys.exit(main())
