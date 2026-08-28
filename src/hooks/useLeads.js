import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useLeads() {
  const [stages, setStages] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    const [stagesRes, leadsRes] = await Promise.all([
      supabase.from('stages').select('*').order('sort_order'),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
    ])
    if (stagesRes.error) setError(stagesRes.error.message)
    else if (leadsRes.error) setError(leadsRes.error.message)
    else {
      setStages(stagesRes.data)
      setLeads(leadsRes.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const createLead = async (fields) => {
    const { data, error } = await supabase.from('leads').insert(fields).select().single()
    if (error) throw error
    setLeads((prev) => [data, ...prev])
    return data
  }

  const updateLead = async (id, fields) => {
    const { data, error } = await supabase.from('leads').update(fields).eq('id', id).select().single()
    if (error) throw error
    setLeads((prev) => prev.map((l) => (l.id === id ? data : l)))
    return data
  }

  const deleteLead = async (id) => {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) throw error
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  const moveLeadToStage = async (id, stageId) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage_id: stageId } : l)))
    const { error } = await supabase.from('leads').update({ stage_id: stageId }).eq('id', id)
    if (error) {
      setError(error.message)
      reload()
    }
  }

  return { stages, leads, loading, error, reload, createLead, updateLead, deleteLead, moveLeadToStage }
}

export function useLeadNotes(leadId) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!leadId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    if (!error) setNotes(data)
    setLoading(false)
  }, [leadId])

  useEffect(() => {
    reload()
  }, [reload])

  const addNote = async (author, body) => {
    const { data, error } = await supabase
      .from('lead_notes')
      .insert({ lead_id: leadId, author, body })
      .select()
      .single()
    if (error) throw error
    setNotes((prev) => [data, ...prev])
  }

  return { notes, loading, addNote }
}
