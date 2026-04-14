import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

// ─── Initial Data ────────────────────────────────────────────────────────────

// Initial data is now empty as it will be loaded from Supabase
const INITIAL_FOODS = []
const INITIAL_ZONES = []
const INITIAL_TABLES = []

const STORAGE_KEY = 'axiph_pos_data'

const INITIAL_STATE = {
  page: 'admin',
  activeZoneId: null,
  activeShift: null,
  shiftHistory: [],
  tables: [],
  zones: [],
  foods: [],
  revenueHistory: [],
  completedSessions: [],
  tick: 0,
  loading: true,
}

// localStorage logic removed

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    case 'SET_PAGE':
      return { ...state, page: action.payload }

    case 'SET_ACTIVE_ZONE':
      return { ...state, activeZoneId: action.payload }



    case 'OPEN_SHIFT':
      return {
        ...state,
        activeShift: {
          id: Date.now(),
          startTime: Date.now(),
          operatorName: action.payload.operatorName,
          initialBalance: action.payload.initialBalance || 0,
        }
      }

    case 'CLOSE_SHIFT': {
      if (!state.activeShift) return state
      const shift = {
        ...state.activeShift,
        endTime: Date.now(),
        totalRevenue: state.completedSessions
          .filter(s => s.startTime >= state.activeShift.startTime)
          .reduce((sum, s) => sum + s.total, 0)
      }
      return {
        ...state,
        activeShift: null,
        shiftHistory: [shift, ...state.shiftHistory]
      }
    }

    case 'START_TABLE':
      if (!state.activeShift) return state // Safety: Shift must be open
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.payload
            ? { ...t, active: true, startTime: Date.now(), orders: [] }
            : t
        ),
      }

    case 'START_MULTIPLE_TABLES':
      if (!state.activeShift) return state
      return {
        ...state,
        tables: state.tables.map(t =>
          action.payload.includes(t.id) && !t.active
            ? { ...t, active: true, startTime: Date.now(), orders: [] }
            : t
        ),
      }

    case 'STOP_TABLE': {
      const table = state.tables.find(t => t.id === action.payload)
      if (!table || !table.active) return state
      
      const elapsedSeconds = Math.floor((Date.now() - table.startTime) / 1000)
      const session = {
        id: Date.now(),
        tableId: table.id,
        tableName: table.name,
        zoneId: table.zoneId,
        startTime: table.startTime,
        endTime: Date.now(),
        elapsedSeconds,
        orders: table.orders,
        pricePerHour: table.pricePerHour,
        total: calcTotal({ ...table, elapsedSeconds }, state.foods),
        date: getLocalDayString(),
      }
      return {
        ...state,
        revenueHistory: updateRevenueHistory(state.revenueHistory, session.total),
        completedSessions: [session, ...state.completedSessions],
        tables: state.tables.map(t =>
          t.id === action.payload
            ? { ...t, active: false, startTime: null, orders: [] }
            : t
        ),
      }
    }

    case 'STOP_MULTIPLE_TABLES': {
      const now = Date.now()
      const newSessions = []
      const updatedTables = state.tables.map(t => {
        if (action.payload.includes(t.id) && t.active) {
          const elapsedSeconds = Math.floor((now - t.startTime) / 1000)
          newSessions.push({
            id: now + Math.random(),
            tableId: t.id,
            tableName: t.name,
            zoneId: t.zoneId,
            startTime: t.startTime,
            endTime: now,
            elapsedSeconds,
            orders: t.orders,
            pricePerHour: t.pricePerHour,
            total: calcTotal({ ...t, elapsedSeconds }, state.foods),
            date: getLocalDayString(),
          })
          return { ...t, active: false, startTime: null, orders: [] }
        }
        return t
      })

      return {
        ...state,
        revenueHistory: newSessions.reduce((h, s) => updateRevenueHistory(h, s.total), state.revenueHistory),
        completedSessions: [...newSessions, ...state.completedSessions],
        tables: updatedTables,
      }
    }

    case 'ADD_ORDER': {
      const { tableId, foodId } = action.payload
      return {
        ...state,
        tables: state.tables.map(t => {
          if (t.id !== tableId) return t
          const existing = t.orders.find(o => o.foodId === foodId)
          const orders = existing
            ? t.orders.map(o => o.foodId === foodId ? { ...o, qty: o.qty + 1 } : o)
            : [...t.orders, { foodId, qty: 1 }]
          return { ...t, orders }
        }),
      }
    }

    case 'REMOVE_ORDER': {
      const { tableId, foodId } = action.payload
      return {
        ...state,
        tables: state.tables.map(t => {
          if (t.id !== tableId) return t
          const orders = t.orders
            .map(o => o.foodId === foodId ? { ...o, qty: o.qty - 1 } : o)
            .filter(o => o.qty > 0)
          return { ...t, orders }
        }),
      }
    }

    case 'ADD_FOOD':
      return { ...state, foods: [...state.foods, { ...action.payload, id: 'f' + Date.now() }] }

    case 'REMOVE_FOOD':
      return { ...state, foods: state.foods.filter(f => f.id !== action.payload) }

    case 'UPDATE_FOOD':
      return {
        ...state,
        foods: state.foods.map(f => f.id === action.payload.id ? { ...f, ...action.payload } : f),
      }

    case 'ADD_ZONE':
      return { ...state, zones: [...state.zones, action.payload] }

    case 'REMOVE_ZONE':
      return {
        ...state,
        zones: state.zones.filter(z => z.id !== action.payload),
        tables: state.tables.filter(t => t.zoneId !== action.payload),
      }

    case 'UPDATE_ZONE_PRICE':
      return {
        ...state,
        zones: state.zones.map(z =>
          z.id === action.payload.zoneId ? { ...z, pricePerHour: action.payload.price } : z
        ),
        tables: state.tables.map(t =>
          t.zoneId === action.payload.zoneId ? { ...t, pricePerHour: action.payload.price } : t
        ),
      }

    case 'UPDATE_ZONE':
      return {
        ...state,
        zones: state.zones.map(z =>
          z.id === action.payload.id ? { ...z, ...action.payload } : z
        ),
      }

    case 'ADD_TABLE': {
      const zone = state.zones.find(z => z.id === action.payload.zoneId)
      return {
        ...state,
        tables: [...state.tables, createTable(
          't' + Date.now(),
          action.payload.name,
          action.payload.zoneId,
          zone?.pricePerHour ?? 10000,
          zone?.isVip ?? false,
        )],
      }
    }

    case 'REMOVE_TABLE':
      return { ...state, tables: state.tables.filter(t => t.id !== action.payload) }

    case 'UPDATE_TABLE_PRICE':
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.payload.id ? { ...t, pricePerHour: action.payload.price } : t
        ),
      }

    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'BOOTSTRAP':
      return {
        ...state,
        ...action.payload,
        // Only set activeZoneId if it's not already set to avoid jumping
        activeZoneId: state.activeZoneId || action.payload.zones?.[0]?.id || null,
      }

    case 'UPDATE_TABLES':
      return {
        ...state,
        tables: action.payload
      }

    case 'SET_ACTIVE_SHIFT':
      return {
        ...state,
        activeShift: action.payload
      }

    default:
      return state
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getLocalDayString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function mapTableData(tables, zones) {
  return (tables || []).map(t => {
    const zone = zones?.find(z => z.id === t.zone_id)
    return {
      ...t,
      zoneId: t.zone_id,
      active: t.is_active,
      startTime: t.start_time ? new Date(t.start_time).getTime() : null,
      isVip: zone ? zone.is_vip : false,
      pricePerHour: zone ? zone.price_per_hour : 10000,
    }
  })
}

export function mapZoneData(zones) {
  return (zones || []).map(z => ({
    ...z,
    isVip: z.is_vip,
    pricePerHour: z.price_per_hour
  }))
}

export function mapShiftData(shift) {
  if (!shift) return null
  return {
    ...shift,
    operatorName: shift.operator_name,
    initialBalance: shift.initial_balance,
    totalRevenue: shift.total_revenue, // Ensure this is mapped
    startTime: shift.start_time ? new Date(shift.start_time).getTime() : null,
    endTime: shift.end_time ? new Date(shift.end_time).getTime() : null,
  }
}

export function mapSessionData(sessions, tables = []) {
  return (sessions || []).map(s => {
    const table = tables.find(t => t.id === s.table_id)
    return {
      ...s,
      tableId: s.table_id,
      tableName: s.table_name || table?.name || 'Stol',
      startTime: s.start_time ? new Date(s.start_time).getTime() : null,
      endTime: s.end_time ? new Date(s.end_time).getTime() : null,
      elapsedSeconds: s.elapsed_seconds,
      total: s.total_amount,
      date: s.start_time ? s.start_time.split('T')[0] : getLocalDayString(),
    }
  }).sort((a, b) => b.endTime - a.endTime)
}

export function aggregateRevenue(sessions) {
  const map = {}
  sessions.forEach(s => {
    const day = s.start_time ? s.start_time.split('T')[0] : getLocalDayString()
    map[day] = (map[day] || 0) + (s.total_amount || 0)
  })
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, revenue]) => ({ date, revenue }))
}

function updateRevenueHistory(history, amount) {
  const today = getLocalDayString()
  const exists = history.find(h => h.date === today)
  if (exists) {
    return history.map(h => h.date === today ? { ...h, revenue: h.revenue + amount } : h)
  }
  return [...history, { date: today, revenue: amount }]
}

export function calcTotal(table, foods = INITIAL_FOODS) {
  // If no startTime, timeCost is 0
  if (!table.active && !table.elapsedSeconds && table.elapsedSeconds !== 0) return 0
  
  // Changed ?? to || because elapsedSeconds: 0 is default for active tables
  const seconds = table.elapsedSeconds || (table.startTime ? Math.floor((Date.now() - table.startTime) / 1000) : 0)
  const timeCost = (seconds / 3600) * table.pricePerHour
  const foodCost = table.orders.reduce((sum, o) => {
    const food = foods.find(f => f.id === o.foodId)
    return sum + (food ? food.price * o.qty : 0)
  }, 0)
  return Math.round(timeCost + foodCost)
}

export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

export function formatPrice(n) {
  return n.toLocaleString('uz-UZ') + ' UZS'
}

// ─── Context ─────────────────────────────────────────────────────────────────

const PosContext = createContext(null)

export function PosProvider({ children }) {
  const { club } = useAuth()
  const { showToast } = useToast()
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // 1. Data Loading Effect
  useEffect(() => {
    if (!club) return

    async function loadAllData() {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const [zones, tables, foods, shifts, sessions] = await Promise.all([
          supabase.from('zones').select('*').eq('club_id', club.id),
          supabase.from('tables').select('*').eq('club_id', club.id),
          supabase.from('foods').select('*').eq('club_id', club.id),
          supabase.from('shifts').select('*').eq('club_id', club.id).order('start_time', { ascending: false }),
          supabase.from('sessions').select('*').eq('club_id', club.id),
        ])

        const activeShift = shifts.data?.find(s => !s.end_time) || null
        const completedShifts = shifts.data?.filter(s => s.end_time) || []
        const mappedZones = mapZoneData(zones.data)

        dispatch({
          type: 'BOOTSTRAP',
          payload: {
            zones: mappedZones,
            tables: mapTableData(tables.data, mappedZones),
            foods: foods.data || [],
            activeShift: mapShiftData(activeShift),
            shiftHistory: completedShifts.map(mapShiftData),
            revenueHistory: aggregateRevenue(sessions.data || []),
            completedSessions: mapSessionData(sessions.data, tables.data),
          }
        })
      } catch (err) {
        console.error('Data load error:', err)
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadAllData()

    // 3. Real-time Subscription
    const channel = supabase.channel('club_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables', filter: `club_id=eq.${club.id}` }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions', filter: `club_id=eq.${club.id}` }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts', filter: `club_id=eq.${club.id}` }, () => loadAllData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [club])



  // Removining localStorage persistence as we'll sync with Supabase directly

  const actions = {
    setPage:         useCallback((p)  => dispatch({ type: 'SET_PAGE',       payload: p }), []),
    setActiveZone:   useCallback((id) => dispatch({ type: 'SET_ACTIVE_ZONE',payload: id }), []),
    
    openShift: useCallback(async ({ operatorName, initialBalance }) => {
      if (!club?.id) {
        console.error('No club found to open shift');
        return;
      }
      try {
        const { data, error } = await supabase
          .from('shifts')
          .insert([{ club_id: club.id, operator_name: operatorName, initial_balance: initialBalance }])
          .select()
          .single()
        
        if (error) throw error
        dispatch({ type: 'SET_ACTIVE_SHIFT', payload: mapShiftData(data) })
      } catch (err) {
        console.error('Open shift error:', err)
        if (typeof showToast !== 'undefined') {
          showToast('Smenani ochishda xatolik yuz berdi: ' + err.message, 'error')
        }
      }
    }, [club]),

    closeShift: useCallback(async () => {
      if (!state.activeShift) return
      
      try {
        const revenue = state.completedSessions
          .filter(s => s.startTime >= state.activeShift.startTime)
          .reduce((sum, s) => sum + (s.total || 0), 0)

        const { error } = await supabase
          .from('shifts')
          .update({ 
            end_time: new Date().toISOString(),
            total_revenue: revenue
          })
          .eq('id', state.activeShift.id)
        
        if (error) throw error
        dispatch({ type: 'SET_ACTIVE_SHIFT', payload: null })
      } catch (err) {
        console.error('Close shift error:', err)
        showToast('Smenani yopishda xatolik yuz berdi: ' + err.message, 'error')
      }
    }, [state.activeShift, state.completedSessions]),

    startTable: useCallback(async (id) => {
      const { error } = await supabase
        .from('tables')
        .update({ is_active: true, start_time: new Date().toISOString() })
        .eq('id', id)
      
      if (!error) {
        dispatch({ type: 'UPDATE_TABLES', payload: state.tables.map(t => t.id === id ? { ...t, active: true, startTime: Date.now() } : t) })
      }
    }, [state]),

    stopTable: useCallback(async (id) => {
      const table = state.tables.find(t => t.id === id)
      if (!table) return

      const now = new Date().toISOString()
      const elapsedSeconds = Math.floor((Date.now() - new Date(table.startTime).getTime()) / 1000)
      const total = calcTotal({ ...table, active: true }, state.foods)

      // 1. Create session record
      await supabase.from('sessions').insert([{
        club_id: club.id,
        table_id: table.id,
        start_time: new Date(table.startTime).toISOString(),
        end_time: now,
        elapsed_seconds: elapsedSeconds,
        total_amount: total,
      }])

      // 2. Reset table
      await supabase.from('tables')
        .update({ is_active: false, start_time: null, orders: [] })
        .eq('id', id)

      // 3. Update local state for tables & sessions
      const { data: updatedTables } = await supabase.from('tables').select('*').eq('club_id', club.id)
      const { data: updatedSessions } = await supabase.from('sessions').select('*').eq('club_id', club.id)
      
      const mappedTables = mapTableData(updatedTables, state.zones)
      dispatch({ type: 'BOOTSTRAP', payload: {
        ...state,
        tables: mappedTables,
        completedSessions: mapSessionData(updatedSessions, updatedTables),
        revenueHistory: aggregateRevenue(updatedSessions || [])
      } })
    }, [club, state]),

    startMultipleTables: useCallback(async (ids) => {
      const { error } = await supabase
        .from('tables')
        .update({ is_active: true, start_time: new Date().toISOString() })
        .in('id', ids)
      
      if (!error) {
        dispatch({ 
          type: 'UPDATE_TABLES', 
          payload: state.tables.map(t => ids.includes(t.id) ? { ...t, active: true, startTime: Date.now() } : t) 
        })
      }
    }, [state]),

    stopMultipleTables: useCallback(async (ids) => {
      const now = new Date().toISOString()
      const nowMs = Date.now()

      const tablesToStop = state.tables.filter(t => ids.includes(t.id) && t.active)
      if (tablesToStop.length === 0) return

      const sessionsToInsert = tablesToStop.map(table => {
        const elapsedSeconds = Math.floor((nowMs - new Date(table.startTime).getTime()) / 1000)
        const total = calcTotal({ ...table, active: true }, state.foods)
        return {
          club_id: club.id,
          table_id: table.id,
          start_time: new Date(table.startTime).toISOString(),
          end_time: now,
          elapsed_seconds: elapsedSeconds,
          total_amount: total,
        }
      })

      // 1. Create session records
      const { error: sessionError } = await supabase.from('sessions').insert(sessionsToInsert)

      if (!sessionError) {
        // 2. Reset tables
        await supabase.from('tables')
          .update({ is_active: false, start_time: null, orders: [] })
          .in('id', ids)

        // 3. Update local state
        const { data: updatedTables } = await supabase.from('tables').select('*').eq('club_id', club.id)
        const { data: updatedSessions } = await supabase.from('sessions').select('*').eq('club_id', club.id)
        
        const mappedTables = mapTableData(updatedTables, state.zones)
        dispatch({ type: 'BOOTSTRAP', payload: {
          ...state,
          tables: mappedTables,
          completedSessions: mapSessionData(updatedSessions, updatedTables),
          revenueHistory: aggregateRevenue(updatedSessions || [])
        } })
      }
    }, [club, state]),

    addOrder: useCallback(async ({ tableId, foodId }) => {
      const table = state.tables.find(t => t.id === tableId)
      if (!table) return

      const existing = table.orders.find(o => o.foodId === foodId)
      const newOrders = existing
        ? table.orders.map(o => o.foodId === foodId ? { ...o, qty: o.qty + 1 } : o)
        : [...table.orders, { foodId, qty: 1 }]

      const { error } = await supabase
        .from('tables')
        .update({ orders: newOrders })
        .eq('id', tableId)

      if (!error) {
        dispatch({ type: 'UPDATE_TABLES', payload: state.tables.map(t => t.id === tableId ? { ...t, orders: newOrders } : t) })
      }
    }, [state]),

    removeOrder: useCallback(async ({ tableId, foodId }) => {
      const table = state.tables.find(t => t.id === tableId)
      if (!table) return

      const newOrders = table.orders
        .map(o => o.foodId === foodId ? { ...o, qty: o.qty - 1 } : o)
        .filter(o => o.qty > 0)

      const { error } = await supabase
        .from('tables')
        .update({ orders: newOrders })
        .eq('id', tableId)

      if (!error) {
        dispatch({ type: 'UPDATE_TABLES', payload: state.tables.map(t => t.id === tableId ? { ...t, orders: newOrders } : t) })
      }
    }, [state]),

    addFood: useCallback(async (p) => {
      const { data, error } = await supabase
        .from('foods')
        .insert([{ ...p, club_id: club.id }])
        .select()
        .single()
      if (!error) dispatch({ type: 'BOOTSTRAP', payload: { foods: [...state.foods, data] } })
    }, [club, state]),

    removeFood: useCallback(async (id) => {
      const { error } = await supabase.from('foods').delete().eq('id', id)
      if (!error) dispatch({ type: 'BOOTSTRAP', payload: { foods: state.foods.filter(f => f.id !== id) } })
    }, [state]),

    updateFood: useCallback(async (p) => {
      const { error } = await supabase.from('foods').update(p).eq('id', p.id)
      if (!error) dispatch({ type: 'BOOTSTRAP', payload: { foods: state.foods.map(f => f.id === p.id ? { ...f, ...p } : f) } })
    }, [state]),

    addZone: useCallback(async (p) => {
      const { data, error } = await supabase
        .from('zones')
        .insert([{ 
          name: p.name, 
          label: p.label, 
          icon: p.icon, 
          is_vip: p.isVip, 
          price_per_hour: p.pricePerHour, 
          club_id: club.id 
        }])
        .select()
        .single()
      if (!error) {
        const mapped = { ...data, isVip: data.is_vip, pricePerHour: data.price_per_hour }
        dispatch({ type: 'BOOTSTRAP', payload: { zones: [...state.zones, mapped] } })
      }
    }, [club, state]),

    removeZone: useCallback(async (id) => {
      const { error } = await supabase.from('zones').delete().eq('id', id)
      if (!error) {
        // Tables are deleted via CASCADE in SQL, but we need to update state
        const { data: updatedTables } = await supabase.from('tables').select('*').eq('club_id', club.id)
        dispatch({ type: 'BOOTSTRAP', payload: { 
          zones: state.zones.filter(z => z.id !== id),
          tables: mapTableData(updatedTables, state.zones) 
        } })
      }
    }, [club, state]),

    updateZone: useCallback(async (p) => {
      const { error } = await supabase
        .from('zones')
        .update({ 
          name: p.name, 
          label: p.label, 
          icon: p.icon, 
          is_vip: p.isVip, 
          price_per_hour: p.pricePerHour 
        })
        .eq('id', p.id)
      if (!error) dispatch({ type: 'BOOTSTRAP', payload: { zones: state.zones.map(z => z.id === p.id ? { ...z, ...p } : z) } })
    }, [state]),

    updateZonePrice: useCallback(async ({ zoneId, price }) => {
      const { error } = await supabase
        .from('zones')
        .update({ price_per_hour: price })
        .eq('id', zoneId)
      
      if (!error) {
        // Update both zone and its tables locally
        dispatch({ type: 'UPDATE_ZONE_PRICE', payload: { zoneId, price } })
      }
    }, [state]),

    addTable: useCallback(async (p) => {
      const zone = state.zones.find(z => z.id === p.zoneId)
      const { data, error } = await supabase
        .from('tables')
        .insert([{ 
          name: p.name, 
          zone_id: p.zoneId, 
          club_id: club.id, 
          is_active: false 
        }])
        .select()
        .single()
      if (!error) {
        const mapped = mapTableData([data], state.zones)[0]
        dispatch({ type: 'UPDATE_TABLES', payload: [...state.tables, mapped] })
      }
    }, [club, state]),

    removeTable: useCallback(async (id) => {
      const { error } = await supabase.from('tables').delete().eq('id', id)
      if (!error) dispatch({ type: 'UPDATE_TABLES', payload: state.tables.filter(t => t.id !== id) })
    }, [state]),
  }

  return (
    <PosContext.Provider value={{ state, ...actions }}>
      {children}
    </PosContext.Provider>
  )
}

export function usePos() {
  const ctx = useContext(PosContext)
  if (!ctx) throw new Error('usePos must be used inside PosProvider')
  return ctx
}
